import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { ChangePassword } from '../models/change-password';
import { catchError, finalize, map, Observable, tap, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { ResetPassword } from '../models/reset-password';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = environment.authUrl;
 private userSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
    private readonly USER_KEY = 'current_user';
   private authService = inject(AuthService);
constructor(   private http: HttpClient,
   ) { }


/**
 * Cambia la contraseña del usuario autenticado
 */
changePassword(request: ChangePassword): Observable<any> {
  this.loadingSignal.set(true);
  this.errorSignal.set(null);

  return this.http.put<ApiResponse<any>>(`${this.baseUrl}/users/change-password`, request)
     .pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error al cambiar contraseña', error);
        this.errorSignal.set(error.error?.message || 'Error al cambiar contraseña');
        return throwError(() => error);
      }),
  
    );
}

/**
 * Restablece la contraseña con token
 */
resetPassword(request: ResetPassword): Observable<any> {
  this.loadingSignal.set(true);
  this.errorSignal.set(null);

  return this.http.post<ApiResponse<any>>(`${this.baseUrl}/users/reset-password`, request)
    .pipe(
      map(response => response.data),
      catchError(error => {
        this.handleAuthError('Error al restablecer contraseña', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
}



/**
 * Actualiza el perfil del usuario
 */
updateProfile(profileData: Partial<User>): Observable<User> {
  this.loadingSignal.set(true);
  this.errorSignal.set(null);

  return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/profile`, profileData)
    .pipe(
      map(response => response.data),
      tap(user => {
        this.userSignal.set(user);
        // Actualizar localStorage
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        // Notificar a AuthService del cambio
        this.authService.updateUserData(user);
      }),
      catchError(error => {
        this.handleAuthError('Error al actualizar perfil', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
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
}
