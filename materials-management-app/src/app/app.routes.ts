import { Routes } from '@angular/router';
/**
 * Configuración principal de rutas de la aplicación
 */
export const routes: Routes = [
{
  path: '',
  redirectTo: '/auth/login', // Cambiar a ruta específica
  pathMatch: 'full'
},
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(r => r.authRoutes)
  },
  {
    path: 'materials',
    loadComponent: () => import('./features/materials/pages/material-list-page/material-list-page.component')
      .then(c => c.MaterialListPageComponent),
    title: 'Materiales'
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];