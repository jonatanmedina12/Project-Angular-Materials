import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { combineLatest, distinctUntilChanged, filter, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Signals para el estado de navegación
  private currentUrlSignal = signal<string>('');
  private isInitializingSignal = signal<boolean>(true);
  private isNavigatingSignal = signal<boolean>(false);
  private shouldShowLayoutSignal = signal<boolean>(true);

  // Computed signals públicos
  readonly currentUrl = computed(() => this.currentUrlSignal());
  readonly isInitializing = computed(() => this.isInitializingSignal());
  readonly isNavigating = computed(() => this.isNavigatingSignal());
  readonly shouldShowLayout = computed(() => this.shouldShowLayoutSignal());
  
  // Rutas que no requieren autenticación
  private readonly publicRoutes = [
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/reset-password',
    '/unauthorized',
    '/404',
    '/500'
  ];

  // Rutas que no deben mostrar el layout principal
  private readonly noLayoutRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/unauthorized',
    '/404',
    '/500'
  ];

  // Rutas protegidas con roles específicos
  private readonly roleProtectedRoutes: { [key: string]: string[] } = {
    '/admin': ['ADMIN'],
    '/users': ['ADMIN', 'MANAGER'],
    '/reports': ['ADMIN', 'MANAGER'],
    '/settings': ['ADMIN']
  };

  constructor() {
    this.initializeNavigation();
  }

  /**
   * Inicializa el servicio de navegación
   */
  private initializeNavigation(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isInitializingSignal.set(false);
      return;
    }

    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.handleRouteChange(event.url);
    });

    // Validar estado inicial
    this.validateInitialRoute();
  }

  /**
   * Valida la ruta inicial al cargar la aplicación
   */
  private validateInitialRoute(): void {
    const currentUrl = this.router.url;
    const token = this.authService.getToken();

    if (token) {
      // Verificar token si existe
      this.authService.verifyToken().subscribe({
        next: (user) => {
          console.log('✅ Token válido, usuario autenticado:', user.firstName);
          this.handleAuthenticatedUser(currentUrl);
          this.isInitializingSignal.set(false);
        },
        error: () => {
          console.log('❌ Token inválido, redirigiendo al login');
          this.handleUnauthenticatedUser(currentUrl);
          this.isInitializingSignal.set(false);
        }
      });
    } else {
      // Sin token
      this.handleUnauthenticatedUser(currentUrl);
      this.isInitializingSignal.set(false);
    }
  }

  /**
   * Maneja cambios de ruta
   */
  private handleRouteChange(url: string): void {
    this.currentUrlSignal.set(url);
    this.updateLayoutVisibility(url);
    
    // Solo validar si ya terminó la inicialización
    if (!this.isInitializing()) {
      this.validateRouteAccess(url);
    }
  }

  /**
   * Actualiza la visibilidad del layout
   */
  private updateLayoutVisibility(url: string): void {
    const shouldHideLayout = this.noLayoutRoutes.some(route => 
      url.startsWith(route)
    );
    this.shouldShowLayoutSignal.set(!shouldHideLayout);
  }

  /**
   * Valida el acceso a una ruta específica
   */
  private validateRouteAccess(url: string): void {
    const isAuthenticated = this.authService.isAuthenticated();
    const isPublicRoute = this.isPublicRoute(url);

    if (!isAuthenticated && !isPublicRoute) {
      this.redirectToLogin(url);
      return;
    }

    if (isAuthenticated && this.isAuthRoute(url)) {
      this.redirectToDefaultRoute();
      return;
    }

    if (isAuthenticated && !this.hasRoleAccess(url)) {
      this.redirectToUnauthorized();
      return;
    }
  }

  /**
   * Maneja usuario autenticado en la inicialización
   */
  private handleAuthenticatedUser(currentUrl: string): void {
    if (this.isAuthRoute(currentUrl)) {
      this.redirectToDefaultRoute();
    } else if (!this.hasRoleAccess(currentUrl)) {
      this.redirectToUnauthorized();
    }
  }

  /**
   * Maneja usuario no autenticado en la inicialización
   */
  private handleUnauthenticatedUser(currentUrl: string): void {
    if (!this.isPublicRoute(currentUrl)) {
      this.redirectToLogin(currentUrl);
    }
  }

  /**
   * Verifica si una ruta es pública
   */
  private isPublicRoute(url: string): boolean {
    return this.publicRoutes.some(route => url.startsWith(route));
  }

  /**
   * Verifica si una ruta es de autenticación
   */
  private isAuthRoute(url: string): boolean {
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
    return authRoutes.some(route => url.startsWith(route));
  }

  /**
   * Verifica si el usuario tiene acceso basado en roles
   */
  private hasRoleAccess(url: string): boolean {
    const user = this.authService.user();
    if (!user) return false;

    // Buscar ruta protegida que coincida
    const protectedRoute = Object.keys(this.roleProtectedRoutes)
      .find(route => url.startsWith(route));

    if (!protectedRoute) return true; // Ruta no protegida por roles

    const allowedRoles = this.roleProtectedRoutes[protectedRoute];
    return allowedRoles.includes(user.role);
  }

  /**
   * Redirige al login guardando la URL actual
   */
  private redirectToLogin(returnUrl?: string): void {
    this.isNavigatingSignal.set(true);
    const queryParams = returnUrl && returnUrl !== '/' ? { returnUrl } : {};
    
    this.router.navigate(['/auth/login'], { queryParams }).finally(() => {
      this.isNavigatingSignal.set(false);
    });
  }

  /**
   * Redirige a la ruta por defecto después del login
   */
  private redirectToDefaultRoute(): void {
    this.isNavigatingSignal.set(true);
    const returnUrl = this.getReturnUrl() || '/materials';
    
    this.router.navigate([returnUrl]).finally(() => {
      this.isNavigatingSignal.set(false);
    });
  }

  /**
   * Redirige a la página de no autorizado
   */
  private redirectToUnauthorized(): void {
    this.isNavigatingSignal.set(true);
    this.router.navigate(['/unauthorized']).finally(() => {
      this.isNavigatingSignal.set(false);
    });
  }

  /**
   * Navega a una ruta con validaciones
   */
  navigateTo(url: string): void {
    if (this.isInitializing() || this.isNavigating()) {
      return; // Prevenir navegación durante inicialización
    }

    this.isNavigatingSignal.set(true);
    this.router.navigate([url]).finally(() => {
      this.isNavigatingSignal.set(false);
    });
  }

  /**
   * Maneja el logout y redirige apropiadamente
   */
  handleLogout(): void {
    this.isNavigatingSignal.set(true);
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Logout exitoso');
        this.router.navigate(['/auth/login']).finally(() => {
          this.isNavigatingSignal.set(false);
        });
      },
      error: (error) => {
        console.error('❌ Error en logout:', error);
        // Forzar limpieza local y redirección
        this.router.navigate(['/auth/login']).finally(() => {
          this.isNavigatingSignal.set(false);
        });
      }
    });
  }

  /**
   * Maneja login exitoso y redirige apropiadamente
   */
  handleSuccessfulLogin(): void {
    const returnUrl = this.getReturnUrl() || '/materials';
    
    this.isNavigatingSignal.set(true);
    this.router.navigate([returnUrl]).finally(() => {
      this.isNavigatingSignal.set(false);
    });
  }

  /**
   * Verifica si una ruta específica está protegida
   */
  isRouteProtected(url: string): boolean {
    return !this.isPublicRoute(url);
  }

  /**
   * Obtiene las rutas permitidas para el usuario actual
   */
  getAllowedRoutes(): string[] {
    const user = this.authService.user();
    if (!user) return this.publicRoutes;

    const allowedRoutes = [...this.publicRoutes];
    
    // Agregar rutas basadas en rol
    Object.keys(this.roleProtectedRoutes).forEach(route => {
      const allowedRoles = this.roleProtectedRoutes[route];
      if (allowedRoles.includes(user.role)) {
        allowedRoutes.push(route);
      }
    });

    return allowedRoutes;
  }

  /**
   * Observable que emite cuando la inicialización está completa
   */
  get initializationComplete$(): Observable<boolean> {
    return combineLatest([
      new Observable<boolean>(observer => {
        observer.next(this.authService.loading());
        observer.complete();
      }),
      new Observable<boolean>(observer => {
        observer.next(this.isInitializing());
        observer.complete();
      })
    ]).pipe(
      map(([authLoading, navigationInitializing]) => 
        !authLoading && !navigationInitializing
      ),
      distinctUntilChanged()
    );
  }

  /**
   * Obtiene la URL de retorno desde los query params
   */
  private getReturnUrl(): string | null {
    try {
      const urlTree = this.router.parseUrl(this.router.url);
      return urlTree.queryParams['returnUrl'] || null;
    } catch {
      return null;
    }
  }

}
