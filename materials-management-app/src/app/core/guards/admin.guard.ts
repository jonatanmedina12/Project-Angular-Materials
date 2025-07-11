
import { CanActivateFn } from "@angular/router";
import { roleGuard } from "./role.guard";

/**
 * Guard específico para administradores
 */
export const adminGuard: CanActivateFn = roleGuard(['ADMIN']);

/**
 * Guard para managers y admins
 */
export const managerGuard: CanActivateFn = roleGuard(['ADMIN', 'MANAGER']);