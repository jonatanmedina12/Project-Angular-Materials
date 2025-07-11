// src/app/features/materials/material.routes.ts
import { Routes } from '@angular/router';

export const materialRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/material-list-page/material-list-page.component')
      .then(c => c.MaterialListPageComponent),
    title: 'Gestión de Materiales'
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/material-form-page/material-form-page.component')
      .then(c => c.MaterialFormPageComponent),
    title: 'Crear Material'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/material-form-page/material-form-page.component')
      .then(c => c.MaterialFormPageComponent),
    title: 'Editar Material'
  },
 
];