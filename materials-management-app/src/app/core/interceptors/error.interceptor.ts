import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

/**
 * Interceptor para manejo centralizado de errores HTTP
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo loggear errores, no mostrar mensajes aquí
      if (!req.url.includes('.svg') && 
          !req.url.includes('icon') && 
          !req.url.includes('assets/') &&
          !req.url.includes('.png')) {
        
        console.error('HTTP Error:', {
          url: req.url,
          status: error.status,
          message: error.message,
          error: error.error
        });
      }
      
      return throwError(() => error);
    })
  );
};