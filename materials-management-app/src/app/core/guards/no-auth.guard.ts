import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { map, take } from "rxjs";

/**
 * Guard para redirigir usuarios autenticados lejos de páginas de auth
 */
export const noAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticatedAsync().pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }

      // Si está autenticado, redirigir a materials
      const returnUrl = route.queryParams?.['returnUrl'] || '/materials';
      router.navigate([returnUrl]);
      
      return false;
    })
  );
};