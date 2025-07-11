import { inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { Router } from "express";
import { isPlatformBrowser } from "@angular/common";

/**
 * Guard para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL a la que intentaba acceder
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};