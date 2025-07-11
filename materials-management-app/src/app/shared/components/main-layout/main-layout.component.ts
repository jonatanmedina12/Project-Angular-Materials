import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
   imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    SidebarComponent,
    HeaderComponent,
    FooterComponent
  ],
  standalone: true
})
export class MainLayoutComponent  {
  // Signal para el estado colapsado del sidebar
  collapsed = signal(false);
  
  private authService = inject(AuthService);
  
  // Computed para calcular el margen dinámicamente
  sidebarMargin = computed(() => this.collapsed() ? '80px' : '256px');
  
  // Computed signals de autenticación
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  /**
   * Toggle del sidebar
   */
  toggleSidebar(): void {
    this.collapsed.update(current => !current);
  }

}
