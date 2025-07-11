import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, output } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderAuthComponent } from '../header-auth/header-auth.component';
import { Router, RouterModule } from '@angular/router';
interface BreadcrumbItem {
  label: string;
  icon?: string;
  url?: string;
}
interface RouteConfig {
  segments: string[];
  breadcrumb: BreadcrumbItem[];
  title: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    CommonModule,
    NzLayoutModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzButtonModule,
    RouterModule,
    HeaderAuthComponent
  ],
  standalone: true
})
export class HeaderComponent {

  // Inputs
  collapsed = input<boolean>(false);
  isMobile = input<boolean>(false);

  // Outputs
  toggleSidebar = output<void>();

  private router = inject(Router);
  private authService = inject(AuthService);

  // Computed para elementos del breadcrumb
  breadcrumbItems = computed(() => this.getBreadcrumbItems());

  // Computed para el título de la página actual
  currentPageTitle = computed(() => this.getPageTitle());

  /**
   * Emite evento para toggle del sidebar
   */
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  /**
   * Obtiene el ícono apropiado para el botón del menú
   */
  getMenuIcon(): string {
    if (this.isMobile()) {
      return 'menu'; // En móvil siempre muestra el ícono de menú
    }
    return this.collapsed() ? 'menu-unfold' : 'menu-fold';
  }

  /**
   * Obtiene los elementos del breadcrumb basado en la ruta actual
   */
  private getBreadcrumbItems(): BreadcrumbItem[] {
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment);

    // Buscar configuración exacta
    const exactMatch = this.routeConfigs.find(config =>
      config.segments.length === segments.length &&
      config.segments.every((segment, index) => segments[index] === segment)
    );

    if (exactMatch) {
      return exactMatch.breadcrumb;
    }

    // Buscar configuración parcial
    const partialMatch = this.routeConfigs.find(config =>
      config.segments.every((segment, index) => segments[index] === segment)
    );

    if (partialMatch) {
      return partialMatch.breadcrumb;
    }

    // Fallback por defecto
    return [{ label: 'Inicio', icon: 'home', url: '/home' }];
  }
  // Configuración de rutas centralizada
  private routeConfigs: RouteConfig[] = [
    {
      segments: ['home'],
      breadcrumb: [{ label: 'Inicio', icon: 'home' }],
      title: 'Dashboard'
    },
    {
      segments: ['materials'],
      breadcrumb: [
        { label: 'Inicio', icon: 'home', url: '/home' },
        { label: 'Materiales', icon: 'inbox' }
      ],
      title: 'Gestión de Materiales'
    },
    {
      segments: ['materials', 'create'],
      breadcrumb: [
        { label: 'Inicio', icon: 'home', url: '/home' },
        { label: 'Materiales', icon: 'inbox', url: '/materials' },
        { label: 'Crear Material', icon: 'plus' }
      ],
      title: 'Crear Material'
    },
    {
      segments: ['profile'],
      breadcrumb: [
        { label: 'Inicio', icon: 'home', url: '/home' },
        { label: 'Mi Perfil', icon: 'user' }
      ],
      title: 'Mi Perfil'
    },
    {
      segments: ['settings'],
      breadcrumb: [
        { label: 'Inicio', icon: 'home', url: '/home' },
        { label: 'Configuración', icon: 'setting' }
      ],
      title: 'Configuración'
    }
  ];
  /**
  * Obtiene el título de la página actual
  */
  private getPageTitle(): string {
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment);

    const matchedConfig = this.routeConfigs.find(config =>
      config.segments.every((segment, index) => segments[index] === segment)
    );

    return matchedConfig?.title || 'Dashboard';

  }
}