import { inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { isPlatformBrowser } from "@angular/common";
import { map, take } from "rxjs";

/**
 * Guard para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticatedAsync().pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      // Guardar la URL actual para redirigir después del login
      const returnUrl = route.url.join('/');
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: returnUrl || '/materials' } 
      });
      
      return false;
    })
  );
};