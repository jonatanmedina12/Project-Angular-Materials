import { Routes } from '@angular/router';

/**
 * Configuración principal de rutas de la aplicación
 */
export const routes: Routes = [
{
    path: '',
    redirectTo: '/home', // Cambiar a /home
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./shared/components/home/home.component')
      .then(c => c.HomeComponent),
    title: 'Dashboard'
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
    path: 'materials/create',
    loadComponent: () => import('./features/materials/pages/material-create-page/material-create-page.component')
      .then(c => c.MaterialCreatePageComponent),
    title: 'Crear Material'
  },
  {
  path: 'cities',
  loadComponent: () => import('./features/cities/components/city/city.component')
    .then(c => c.CityComponent),
  title: 'Gestión de Ciudades'
},
  {
  path: 'profile',
  loadComponent: () => import('./features/users/profile/profile.component')
    .then(c => c.ProfileComponent),
  title: 'Mi Perfil'
},
{
  path: 'settings',
  loadComponent: () => import('./features/users/settings/settings.component')
    .then(c => c.SettingsComponent),
  title: 'Configuración'
},
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component')
      .then(c => c.UnauthorizedComponent),
    title: 'No autorizado'
  },
  {
    path: '404',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(c => c.NotFoundComponent),
    title: 'Página no encontrada'
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];