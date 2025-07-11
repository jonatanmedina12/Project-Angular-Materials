import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/materials',
    pathMatch: 'full'
  },
  {
    path: 'materials',
    loadChildren: () => import('./features/materials/material.routes')
      .then(r => r.materialRoutes)
  },
  {
    path: '**',
    redirectTo: '/materials'
  }
];