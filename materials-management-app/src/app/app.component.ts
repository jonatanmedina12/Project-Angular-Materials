import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MainLayoutComponent } from "./shared/components/main-layout/main-layout.component";
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
   protected readonly title = signal('Material Management System');
  
  // Signal para controlar si mostrar el layout completo
  private showMainLayoutSignal = signal(true);
  
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Computed signals
  readonly showMainLayout = computed(() => this.showMainLayoutSignal());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  ngOnInit(): void {
    // Escuchar cambios de ruta para determinar si mostrar el layout
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateLayoutVisibility(event.url);
    });
    
    // Verificar token al iniciar la aplicación si existe
    this.initializeAuth();
  }

  /**
   * Inicializa la autenticación verificando token existente
   */
  private initializeAuth(): void {
    const token = this.authService.getToken();
    
    if (token) {
      this.authService.verifyToken().subscribe({
        next: (user) => {
          console.log('Token válido, usuario autenticado:', user.firstName);
        },
        error: (error) => {
          console.log('Token inválido o expirado, redirigiendo al login');
          // El servicio ya maneja la limpieza y redirección
        }
      });
    }
  }

  /**
   * Actualiza la visibilidad del layout principal basado en la ruta
   */
  private updateLayoutVisibility(url: string): void {
    // Rutas que no deben mostrar el layout principal
    const authRoutes = [
      '/auth/login', 
      '/auth/register', 
      '/auth/forgot-password',
      '/auth/reset-password'
    ];
    
    const specialRoutes = [
      '/unauthorized',
      '/404',
      '/500'
    ];
    
    const hideLayoutRoutes = [...authRoutes, ...specialRoutes];
    const shouldHideLayout = hideLayoutRoutes.some(route => url.startsWith(route));
    
    this.showMainLayoutSignal.set(!shouldHideLayout);
  }
}
