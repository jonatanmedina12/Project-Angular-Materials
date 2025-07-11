import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  /**
   * Obtiene la URL base de la API
   */
  get apiUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Obtiene la URL base de autenticación
   */
  get authUrl(): string {
    return environment.authUrl;
  }

  /**
   * Verifica si está en producción
   */
  get isProduction(): boolean {
    return environment.production;
  }

  /**
   * Obtiene el nombre del environment actual
   */
  get environmentName(): string {
    return environment.name;
  }

  /**
   * Obtiene la configuración completa del environment
   */
  get environment() {
    return environment;
  }

  /**
   * Construye una URL completa para un endpoint específico
   */
  buildApiUrl(endpoint: string): string {
    return `${this.apiUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  /**
   * Construye una URL completa para un endpoint de autenticación
   */
  buildAuthUrl(endpoint: string): string {
    return `${this.authUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  /**
   * Log de configuración para debugging
   */
  logConfig(): void {
    if (!this.isProduction) {
      console.log('🔧 Configuración actual:', {
        environment: this.environmentName,
        apiUrl: this.apiUrl,
        authUrl: this.authUrl,
        production: this.isProduction
      });
    }
  }
}
