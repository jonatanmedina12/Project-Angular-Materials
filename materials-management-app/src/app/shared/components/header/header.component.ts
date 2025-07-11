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
export class HeaderComponent  {

    // Inputs
  collapsed = input<boolean>(false);
  
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
   * Obtiene los elementos del breadcrumb basado en la ruta actual
   */
  private getBreadcrumbItems(): BreadcrumbItem[] {
    const url = this.router.url;
    const segments = url.split('/').filter((segment: any) => segment);
    
    const items: BreadcrumbItem[] = [
      { label: 'Inicio', icon: 'home', url: '/materials' }
    ];

    if (segments.includes('materials')) {
      items.push({ label: 'Materiales', icon: 'inbox', url: '/materials' });
      
      if (segments.includes('create')) {
        items.push({ label: 'Crear Material', icon: 'plus' });
      } else if (segments.includes('edit')) {
        items.push({ label: 'Editar Material', icon: 'edit' });
      }
    } else if (segments.includes('admin')) {
      items.push({ label: 'Administración', icon: 'crown', url: '/admin' });
      
      if (segments.includes('users')) {
        items.push({ label: 'Usuarios', icon: 'team' });
      } else if (segments.includes('roles')) {
        items.push({ label: 'Roles', icon: 'safety' });
      }
    } else if (segments.includes('profile')) {
      items.push({ label: 'Mi Perfil', icon: 'user' });
    } else if (segments.includes('settings')) {
      items.push({ label: 'Configuración', icon: 'setting' });
    } else if (segments.includes('reports')) {
      items.push({ label: 'Reportes', icon: 'bar-chart' });
    }

    return items;
  }

  /**
   * Obtiene el título de la página actual
   */
  private getPageTitle(): string {
    const url = this.router.url;
    const segments = url.split('/').filter((segment: any) => segment);
    
    if (segments.includes('materials')) {
      if (segments.includes('create')) {
        return 'Crear Material';
      } else if (segments.includes('edit')) {
        return 'Editar Material';
      }
      return 'Gestión de Materiales';
    } else if (segments.includes('admin')) {
      if (segments.includes('users')) {
        return 'Gestión de Usuarios';
      } else if (segments.includes('roles')) {
        return 'Gestión de Roles';
      }
      return 'Panel de Administración';
    } else if (segments.includes('profile')) {
      return 'Mi Perfil';
    } else if (segments.includes('settings')) {
      return 'Configuración';
    } else if (segments.includes('reports')) {
      return 'Reportes';
    }
    
    return 'Dashboard';
  }

}
