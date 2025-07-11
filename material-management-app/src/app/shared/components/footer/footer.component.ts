import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
   imports: [
    CommonModule,
    NzLayoutModule,
    NzDividerModule,
    NzIconModule
  ],
  standalone: true
})
export class FooterComponent  {
 private authService = inject(AuthService);

  // Computed signals
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly user = computed(() => this.authService.user());

  // Información de la aplicación
  readonly currentYear = new Date().getFullYear();
  readonly angularVersion = '19';
  readonly buildNumber = this.generateBuildNumber();

  /**
   * Genera un número de build basado en la fecha
   */
  private generateBuildNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

}
