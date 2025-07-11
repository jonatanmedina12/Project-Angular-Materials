import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

/**
 * Guard para redirigir usuarios autenticados lejos de páginas de auth
 */
export const noAuthGuard: CanActivateFn = () => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si ya está autenticado, redirigir al dashboard
  router.navigate(['/materials']);
  return false;
};