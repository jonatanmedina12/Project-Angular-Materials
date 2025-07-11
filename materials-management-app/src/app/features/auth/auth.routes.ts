import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component')
      .then(c => c.LoginComponent),
    title: 'Iniciar Sesión'
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component')
      .then(c => c.RegisterComponent),
    title: 'Crear Cuenta'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component')
      .then(c => c.ForgotPasswordComponent),
    title: 'Recuperar Contraseña'
  }
];