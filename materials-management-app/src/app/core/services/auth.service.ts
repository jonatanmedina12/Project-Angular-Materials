import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { catchError, finalize, map, Observable, tap, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = environment.authUrl;
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
  readonly isAdmin = computed(() => {
    const user = this.user();
    return user?.roles?.includes('ADMIN') || user?.role === 'ADMIN';
  });
  readonly isManager = computed(() => {
    const user = this.user();
    return user?.roles?.includes('MANAGER') || user?.roles?.includes('ADMIN') || 
           user?.role === 'MANAGER' || user?.role === 'ADMIN';
  });

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

    
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);
    

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
     
        // Verificar si el token no está expirado
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = Date.now() >= payload.exp * 1000;
          
          if (isExpired) {
            this.clearAuthData();
            return;
          }
        } catch (tokenError) {
          this.clearAuthData();
          return;
        }
        
        this.tokenSignal.set(token);
        this.userSignal.set(user);
      } catch (error) {
        console.error('❌ Error parseando datos de usuario:', error);
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
    
    console.log('🔐 Intentando login para:', credentials.usernameOrEmail);

    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        map(response => response.data),
        tap(loginResponse => {
          this.setAuthData(loginResponse);
        }),
        catchError(error => {
          console.log('❌ Error en login:', error.status, error.error?.message);
          
          // Manejar diferentes tipos de errores de login
          let errorMessage = 'Error al iniciar sesión';
          
          if (error.status === 401) {
            errorMessage = 'Credenciales incorrectas';
          } else if (error.status === 403) {
            errorMessage = 'Cuenta bloqueada o sin permisos';
          } else if (error.status === 429) {
            errorMessage = 'Demasiados intentos. Intenta más tarde';
          } else if (error.status === 0) {
            errorMessage = 'Error de conexión con el servidor';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.errorSignal.set(errorMessage);
          return throwError(() => error);
        }),
        finalize(() => {
          this.loadingSignal.set(false);
        })
      );
  }
  /**
 * Obtiene la información del usuario actual
 */
getCurrentUser(): Observable<User> {
  return this.http.get<ApiResponse<User>>(`${this.baseUrl}/auth/me`)
    .pipe(
      map(response => response.data),
      tap(user => {
        this.userSignal.set(user);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
}

/**
 * Actualiza los datos del usuario en el signal
 */
updateUserData(user: User): void {
  this.userSignal.set(user);
  
  // Actualizar también en localStorage si es necesario
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}
/**
 * Verifica autenticación de forma asíncrona
 * Previene el flash durante la verificación inicial
 */
isAuthenticatedAsync(): Observable<boolean> {
  return new Observable(observer => {
    // Verificar si hay token en localStorage
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (!token) {
      observer.next(false);
      observer.complete();
      return;
    }

    // Verificar si el token es válido
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() >= payload.exp * 1000;
      
      if (isExpired) {
        this.logout();
        observer.next(false);
      } else {
        observer.next(true);
      }
    } catch (error) {
      this.logout();
      observer.next(false);
    }
    
    observer.complete();
  });
}

/**
 * Registra un nuevo usuario
 */
register(userData: RegisterRequest): Observable<User> {
  this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/auth/register`, userData)
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
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.clearAuthData();
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('localStorage no disponible'));
    }
    
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    return this.http.post(`${this.baseUrl}/auth/logout`, { refreshToken })
      .pipe(
        catchError(error => {
          console.error('❌ Error al cerrar sesión en el servidor:', error);
          // Continuar con el logout local aunque falle el servidor
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
    
    if (!refreshToken) {
      this.clearAuthData();
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('🔄 Intentando refrescar token...');
    
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/refresh`, { refreshToken })
      .pipe(
        map(response => response.data),
        tap(loginResponse => {
          this.setAuthData(loginResponse);
        }),
        catchError(error => {
          console.error('❌ Error al refrescar token:', error);
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
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/auth/validate`)
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

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/forgot-password`, { email })
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
 
    
    try {
      const accessToken = loginResponse.tokens.accessToken;
      const refreshToken = loginResponse.tokens.refreshToken;
      const user = loginResponse.user;
      
    
      
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      
      this.tokenSignal.set(accessToken);
      this.userSignal.set(user);
      
      
      // Verificar que se guardó correctamente
      const savedToken = localStorage.getItem(this.TOKEN_KEY);
      const savedUser = localStorage.getItem(this.USER_KEY);
  
      
    } catch (error) {
      console.error('❌ Error guardando datos de autenticación:', error);
      this.clearAuthData();
    }
  }

  /**
   * Limpia los datos de autenticación
   */
  private clearAuthData(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    
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
    const user = this.user();
    return user?.roles?.includes(role) || user?.role === role || false;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.user();
    if (!user) return false;
    
    // Verificar en el array de roles
    if (user.roles) {
      return user.roles.some(userRole => roles.includes(userRole));
    }
    
    // Verificar en el campo role (compatibilidad hacia atrás)
    return user.role ? roles.includes(user.role) : false;
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    const user = this.user();
    return user?.permissions?.includes(permission) || false;
  }

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   */
  hasAnyPermission(permissions: string[]): boolean {
    const user = this.user();
    if (!user?.permissions) return false;
    
    return user.permissions.some(userPermission => permissions.includes(userPermission));
  }
}
