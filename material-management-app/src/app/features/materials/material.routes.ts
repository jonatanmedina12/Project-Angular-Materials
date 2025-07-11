// src/app/features/materials/material.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard, managerGuard } from '../../core/guards/admin.guard';

export const materialRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/material-list-page/material-list-page.component')
      .then(c => c.MaterialListPageComponent),
    canActivate: [authGuard],
    title: 'Gestión de Materiales'
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/material-form-page/material-form-page.component')
      .then(c => c.MaterialFormPageComponent),
    canActivate: [managerGuard], // Solo managers y admins pueden crear
    title: 'Crear Material'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/material-form-page/material-form-page.component')
      .then(c => c.MaterialFormPageComponent),
    canActivate: [managerGuard], // Solo managers y admins pueden editar
    title: 'Editar Material'
  },
 
];