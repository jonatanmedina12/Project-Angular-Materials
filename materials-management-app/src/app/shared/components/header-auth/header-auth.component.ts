import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService } from '../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-header-auth',
  templateUrl: './header-auth.component.html',
  styleUrls: ['./header-auth.component.scss'],
   imports: [
    CommonModule,
    RouterModule,
    NzDropDownModule,
    NzIconModule,
    NzAvatarModule,
    NzButtonModule,
    NzDividerModule,
    NzTagModule
  ],
  standalone: true
})
export class HeaderAuthComponent  {

  private authService = inject(AuthService);
  private messageService = inject(NzMessageService);

  // Computed signals
  readonly user = computed(() => this.authService.user());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly isAdmin = computed(() => this.authService.isAdmin());

  /**
   * Obtiene el color del rol
   */
  getRoleColor(): string {
    const role = this.user()?.role;
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'MANAGER':
        return 'orange';
      case 'USER':
        return 'blue';
      default:
        return 'default';
    }
  }

  /**
   * Obtiene la etiqueta del rol
   */
  getRoleLabel(): string {
    const role = this.user()?.role;
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'MANAGER':
        return 'Gerente';
      case 'USER':
        return 'Usuario';
      default:
        return 'Usuario';
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.messageService.success('Sesión cerrada exitosamente');
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        // Aún así redirigir al login
      }
    });
  }

}
