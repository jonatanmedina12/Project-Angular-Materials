import { Component, computed, inject, OnInit, signal, HostListener, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
export class MainLayoutComponent implements OnInit, OnDestroy {
  // Signals para el estado del sidebar
  collapsed = signal(false);
  isMobile = signal(false);
  sidebarOpen = signal(false); // Para controlar el sidebar en móvil
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  
  // Computed para calcular el margen dinámicamente
  sidebarMargin = computed(() => {
    if (this.isMobile()) {
      return '0px'; // En móvil no hay margen
    }
    return this.collapsed() ? '80px' : '256px';
  });
  
  // Computed signals de autenticación
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  ngOnInit(): void {
    this.checkScreenSize();
    
    // Suscribirse a los cambios de navegación para cerrar el sidebar móvil
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.isMobile() && this.sidebarOpen()) {
          this.sidebarOpen.set(false);
          document.body.classList.remove('sidebar-open');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Limpiar clase del body al destruir el componente
    document.body.classList.remove('sidebar-open');
  }

  /**
   * Escucha cambios en el tamaño de la ventana
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  /**
   * Verifica el tamaño de la pantalla
   */
  private checkScreenSize(): void {
    const isMobileSize = window.innerWidth <= 768;
    this.isMobile.set(isMobileSize);
    
    // Si cambia a desktop, cerrar el sidebar móvil
    if (!isMobileSize) {
      this.sidebarOpen.set(false);
      document.body.classList.remove('sidebar-open');
    }
  }

  /**
   * Toggle del sidebar
   */
  toggleSidebar(): void {
    if (this.isMobile()) {
      // En móvil, toggle del estado open/close
      this.sidebarOpen.update(current => !current);
      // Agregar/quitar clase al body para prevenir scroll
      if (this.sidebarOpen()) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    } else {
      // En desktop, toggle del estado collapsed
      this.collapsed.update(current => !current);
    }
  }

  /**
   * Cierra el sidebar móvil
   */
  closeMobileSidebar(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
      document.body.classList.remove('sidebar-open');
    }
  }

}
