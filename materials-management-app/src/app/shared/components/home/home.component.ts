import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  permission?: string;
}

interface DashboardStat {
  title: string;
  value: number;
  icon: string;
  color: string;
  suffix?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
   imports: [
    CommonModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule
  ],
  standalone: true
})
export class HomeComponent  {

 private authService = inject(AuthService);
  private router = inject(Router);

  // Computed signals
  readonly user = computed(() => this.authService.user());
  readonly isAdmin = computed(() => this.authService.isAdmin());
  readonly isManager = computed(() => this.authService.isManager());

  // Datos simulados para el dashboard
  dashboardStats: DashboardStat[] = [
    {
      title: 'Total Materiales',
      value: 156,
      icon: 'inbox',
      color: '#1890ff'
    },
    {
      title: 'Materiales Activos',
      value: 142,
      icon: 'check-circle',
      color: '#52c41a'
    },
    {
      title: 'Usuarios Registrados',
      value: 23,
      icon: 'team',
      color: '#722ed1'
    },
    {
      title: 'Reportes Generados',
      value: 87,
      icon: 'bar-chart',
      color: '#fa8c16'
    }
  ];

  // Acciones rápidas disponibles
  quickActions: QuickAction[] = [
    {
      title: 'Gestionar Materiales',
      description: 'Ver, crear y editar materiales del sistema',
      icon: 'inbox',
      route: '/materials',
      color: '#1890ff'
    },
    {
      title: 'Mi Perfil',
      description: 'Actualizar información personal y contraseña',
      icon: 'user',
      route: '/profile',
      color: '#52c41a'
    },
    {
      title: 'Configuración',
      description: 'Personalizar preferencias del sistema',
      icon: 'setting',
      route: '/settings',
      color: '#722ed1'
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: 'team',
      route: '/admin/users',
      color: '#fa8c16',
      permission: 'ADMIN'
    },
    {
      title: 'Reportes',
      description: 'Generar y consultar reportes',
      icon: 'bar-chart',
      route: '/reports',
      color: '#13c2c2',
      permission: 'MANAGER'
    },
    {
      title: 'Gestión de Roles',
      description: 'Configurar roles y permisos',
      icon: 'safety-certificate',
      route: '/admin/roles',
      color: '#eb2f96',
      permission: 'ADMIN'
    }
  ];

  /**
   * Obtiene las acciones rápidas filtradas por permisos
   */
  getAvailableActions(): QuickAction[] {
    return this.quickActions.filter(action => {
      if (!action.permission) return true;
      
      if (action.permission === 'ADMIN') {
        return this.isAdmin();
      }
      
      if (action.permission === 'MANAGER') {
        return this.isManager() || this.isAdmin();
      }
      
      return true;
    });
  }

  /**
   * Obtiene las estadísticas filtradas por permisos
   */
  getAvailableStats(): DashboardStat[] {
    if (this.isAdmin()) {
      return this.dashboardStats;
    } else if (this.isManager()) {
      return this.dashboardStats.filter(stat => 
        stat.title !== 'Usuarios Registrados'
      );
    } else {
      return this.dashboardStats.filter(stat => 
        stat.title === 'Total Materiales' || stat.title === 'Materiales Activos'
      );
    }
  }

  /**
   * Navega a una ruta específica
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Obtiene el saludo personalizado
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    const user = this.user();
    const name = user?.firstName || user?.username || 'Usuario';

    if (hour < 12) {
      return `Buenos días, ${name}`;
    } else if (hour < 18) {
      return `Buenas tardes, ${name}`;
    } else {
      return `Buenas noches, ${name}`;
    }
  }

  /**
   * Obtiene la fecha actual formateada
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Obtiene el último acceso formateado
   */
  getLastLoginFormatted(): string {
    const user = this.user();
    if (user?.lastLogin) {
      return new Date(user.lastLogin).toLocaleString('es-ES');
    }
    return 'Primera sesión';
  }

  /**
   * Obtiene los roles del usuario
   */
  getUserRoles(): string[] {
    const user = this.user();
    return user?.roles || (user?.role ? [user.role] : ['Usuario']);
  }
}
