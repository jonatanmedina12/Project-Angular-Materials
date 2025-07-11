import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

/**
 * Guard para proteger rutas basado en roles
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Usuario autenticado pero sin permisos
    router.navigate(['/unauthorized']);
    return false;
  };
};