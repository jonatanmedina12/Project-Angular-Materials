import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { catchError, switchMap, throwError } from "rxjs";

/**
 * Interceptor para agregar token JWT a las peticiones HTTP
 * - Agrega automáticamente el token Bearer a peticiones autenticadas
 * - Maneja el refresh automático de tokens expirados de forma específica
 * - Evita loops infinitos en endpoints públicos
 * - Distingue entre errores de token JWT y otros tipos de errores 401
 * - Permite que el NavigationService maneje errores no relacionados con JWT
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // URLs que no requieren autenticación (incluyendo rutas del NavigationService)
  const publicUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/refresh',
    '/unauthorized',
    '/404',
    '/500'
  ];

  // Verificar si la URL es pública de forma más precisa
  const isPublicUrl = publicUrls.some(url => {
    // Verificar coincidencia exacta o que la URL termine con la ruta pública
    return req.url === url || 
           req.url.endsWith(url) || 
           req.url.includes(url + '?') || 
           req.url.includes(url + '/') ||
           req.url.includes(url + '#');
  });
  
  // Si es una URL pública o no hay token, continuar sin modificar
  if (isPublicUrl || !token) {
    return next(req);
  }

  // Clonar la petición y agregar el token
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(
    catchError(error => {
      // Solo manejar errores 401 específicamente relacionados con autenticación JWT
      const isAuthEndpoint = publicUrls.some(url => req.url.includes(url));
      const isRefreshEndpoint = req.url.includes('/auth/refresh');
      
      // NO manejar errores 401 en endpoints públicos o de refresh
      if (error.status === 401 && !isAuthEndpoint && !isRefreshEndpoint) {
        
        // Verificar si es realmente un error de token JWT específico
        const errorMessage = error.error?.message || error.message || '';
        const errorCode = error.error?.code || '';
        
        // Ser muy específico sobre qué errores 401 son de token
        const isJwtTokenError = 
          errorMessage.toLowerCase().includes('jwt') ||
          errorMessage.toLowerCase().includes('token expired') ||
          errorMessage.toLowerCase().includes('token invalid') ||
          errorMessage.toLowerCase().includes('malformed token') ||
          errorMessage.toLowerCase().includes('token malformed') ||
          errorCode === 'TOKEN_EXPIRED' ||
          errorCode === 'INVALID_TOKEN' ||
          errorCode === 'JWT_EXPIRED' ||
          errorCode === 'JWT_MALFORMED' ||
          // También verificar headers de respuesta para ser más específico
          (error.headers?.get('WWW-Authenticate')?.includes('Bearer') && 
           (errorMessage.toLowerCase().includes('expired') || 
            errorMessage.toLowerCase().includes('invalid')));
        
        // Evitar refresh para errores de permisos/autorización
        const isPermissionError = 
          errorMessage.toLowerCase().includes('permission') ||
          errorMessage.toLowerCase().includes('access denied') ||
          errorMessage.toLowerCase().includes('forbidden') ||
          errorMessage.toLowerCase().includes('not authorized') ||
          errorCode === 'INSUFFICIENT_PERMISSIONS' ||
          errorCode === 'ACCESS_DENIED';
        
        // Solo intentar refresh si es específicamente un error de JWT
        if (isJwtTokenError && !isPermissionError) {
          console.log('🔄 Token JWT expirado/inválido, intentando refrescar...', { 
            url: req.url,
            errorMessage,
            errorCode 
          });
          
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Retry con el nuevo token
              const newToken = authService.getToken();
              if (!newToken) {
                throw new Error('No se pudo obtener el nuevo token');
              }
              
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              console.log('🔄 Reintentando petición con nuevo token');
              return next(retryReq);
            }),
            catchError(refreshError => {
              // Si no se puede refrescar, limpiar sesión
              console.log('❌ No se pudo refrescar el token, limpiando sesión');
              authService.logout().subscribe({
                error: (logoutError) => console.error('Error en logout:', logoutError)
              });
              return throwError(() => refreshError);
            })
          );
        } else {
          // Es un 401 pero no relacionado con JWT (permisos, rutas no encontradas, etc.)
          console.log('⚠️ Error 401 no relacionado con token JWT:', { 
            url: req.url,
            errorMessage,
            errorCode,
            isPermissionError 
          });
        }
      }
      
      // Para cualquier otro error, dejar que el sistema de navegación lo maneje
      return throwError(() => error);
    })
  );
};