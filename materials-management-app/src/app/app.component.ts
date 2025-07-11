import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MainLayoutComponent } from "./shared/components/main-layout/main-layout.component";
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs';
import { NavigationService } from './core/guards/navigation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
    protected readonly title = signal('Sistema de Gestión de Materiales');
  
  private authService = inject(AuthService);
  private navigationService = inject(NavigationService);
  
  // Computed signals que reaccionan a los servicios
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly isInitializing = computed(() => 
    this.navigationService.isInitializing() || this.authService.loading()
  );
  readonly shouldShowLayout = computed(() => 
    this.navigationService.shouldShowLayout() && this.isAuthenticated()
  );
  readonly currentUrl = computed(() => this.navigationService.currentUrl());

  ngOnInit(): void {
    console.log('🚀 Aplicación iniciada');
    
    // Suscribirse a cuando la inicialización esté completa
    this.navigationService.initializationComplete$.subscribe(isComplete => {
      if (isComplete) {
        console.log('✅ Inicialización completa');
      }
    });
  }
}
