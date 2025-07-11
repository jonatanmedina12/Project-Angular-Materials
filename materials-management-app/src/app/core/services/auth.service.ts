import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { catchError, finalize, map, Observable, tap, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  // Signals para el estado de autenticación
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed signals
  readonly user = computed(() => this.userSignal());
  readonly token = computed(() => this.tokenSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  readonly isManager = computed(() => 
    this.user()?.role === 'MANAGER' || this.user()?.role === 'ADMIN'
  );

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  private initializeAuth(): void {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.tokenSignal.set(token);
        this.userSignal.set(user);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/login`, credentials)
      .pipe(
        map(response => response.data),
        tap(loginResponse => {
          this.setAuthData(loginResponse);
        }),
        catchError(error => {
          this.handleAuthError('Error al iniciar sesión', error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.loadingSignal.set(false);
        })
      );
  }

  /**
   * Registra un nuevo usuario
   */
  register(userData: RegisterRequest): Observable<User> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/register`, userData)
      .pipe(
        map(response => response.data),
        catchError(error => {
          this.handleAuthError('Error al registrar usuario', error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.loadingSignal.set(false);
        })
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): Observable<any> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    return this.http.post(`${this.baseUrl}/logout`, { refreshToken })
      .pipe(
        catchError(error => {
          console.error('Error al cerrar sesión:', error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.clearAuthData();
          this.router.navigate(['/auth/login']);
        })
      );
  }

  /**
   * Refresca el token de acceso
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
     if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return throwError(() => new Error('No se puede acceder a localStorage'));
    }
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/refresh`, { refreshToken })
      .pipe(
        map(response => response.data),
        tap(loginResponse => {
          this.setAuthData(loginResponse);
        }),
        catchError(error => {
          this.clearAuthData();
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
  }

  /**
   * Verifica si el token es válido
   */
  verifyToken(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/verify`)
      .pipe(
        map(response => response.data),
        tap(user => {
          this.userSignal.set(user);
        }),
        catchError(error => {
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  /**
   * Solicita restablecimiento de contraseña
   */
  forgotPassword(email: string): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/forgot-password`, { email })
      .pipe(
        catchError(error => {
          this.handleAuthError('Error al solicitar restablecimiento', error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.loadingSignal.set(false);
        })
      );
  }

  /**
   * Establece los datos de autenticación
   */
  private setAuthData(loginResponse: LoginResponse): void {
   

    localStorage.setItem(this.TOKEN_KEY, loginResponse.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.user));
    
    this.tokenSignal.set(loginResponse.token);
    this.userSignal.set(loginResponse.user);
  }

  /**
   * Limpia los datos de autenticación
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.errorSignal.set(null);
  }

  /**
   * Maneja errores de autenticación
   */
  private handleAuthError(message: string, error: any): void {
    console.error(message, error);
    
    let errorMessage = message;
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Credenciales inválidas';
    } else if (error.status === 403) {
      errorMessage = 'Acceso no autorizado';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión con el servidor';
    }
    
    this.errorSignal.set(errorMessage);
  }

  /**
   * Limpia el error actual
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null; // o return según el método
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.user()?.role === role;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.user()?.role;
    return userRole ? roles.includes(userRole) : false;
  }
}
