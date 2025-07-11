import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
   imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule
  ],
  standalone: true
})
export class SidebarComponent  {
 // Inputs
  collapsed = input<boolean>(false);
  isMobile = input<boolean>(false);
  sidebarOpen = input<boolean>(false);
  
  // Outputs
  toggleSidebar = output<void>();
  closeMobileSidebar = output<void>();
  
  private authService = inject(AuthService);
  
  // Computed signals
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly isAdmin = computed(() => this.authService.isAdmin());
  readonly isManager = computed(() => this.authService.isManager());
  readonly user = computed(() => this.authService.user());

  /**
   * Verifica si puede acceder a funciones de gestión
   */
  canAccessManagement(): boolean {
    return this.isManager() || this.isAdmin();
  }

  /**
   * Maneja el click en un item del menú en móvil
   */
  onMenuItemClick(): void {
    if (this.isMobile()) {
      this.closeMobileSidebar.emit();
    }
  }

}
