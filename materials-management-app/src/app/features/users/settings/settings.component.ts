import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NavigationService } from '../../../core/guards/navigation.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
   imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzButtonModule,
    NzSwitchModule,
    NzIconModule,
    NzDividerModule,
    NzModalModule  
  ],
  standalone: true
})
export class SettingsComponent  {

private authService = inject(AuthService);
  private navigationService = inject(NavigationService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  // Signals para el estado del componente
  private loadingSignal = signal(false);
  
  // Computed signals
  readonly loading = computed(() => this.loadingSignal());
  readonly user = computed(() => this.authService.user());

  // Formulario de configuraciones
  settingsForm!: FormGroup;

  constructor() {
    this.initializeForm();
    this.loadUserSettings();
  }

  /**
   * Inicializa el formulario de configuraciones
   */
  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [false],
      weeklyReports: [true],
      darkMode: [false],
      language: ['es']
    });
  }

  /**
   * Carga las configuraciones del usuario desde localStorage
   */
  private loadUserSettings(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          this.settingsForm.patchValue(settings);
        } catch (error) {
          console.error('Error al cargar configuraciones:', error);
        }
      }
    }
  }

  /**
   * Guarda las configuraciones en localStorage
   */
  saveSettings(): void {
    this.loadingSignal.set(true);
    
    const settings = this.settingsForm.value;
    
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('user_settings', JSON.stringify(settings));
        this.message.success('Configuraciones guardadas exitosamente');
      }
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
      this.message.error('Error al guardar las configuraciones');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Resetea las configuraciones a los valores por defecto
   */
  resetSettings(): void {
    this.modal.confirm({
      nzTitle: '¿Estás seguro?',
      nzContent: 'Esta acción restaurará todas las configuraciones a sus valores por defecto.',
      nzOkText: 'Confirmar',
      nzCancelText: 'Cancelar',
      nzOnOk: () => {
        this.settingsForm.reset({
          emailNotifications: true,
          pushNotifications: false,
          weeklyReports: true,
          darkMode: false,
          language: 'es'
        });
        
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.removeItem('user_settings');
        }
        
        this.message.success('Configuraciones restauradas');
      }
    });
  }

  /**
   * Maneja el cierre de sesión con confirmación
   */
  logout(): void {
    this.modal.confirm({
      nzTitle: 'Cerrar sesión',
      nzContent: '¿Estás seguro de que quieres cerrar sesión?',
      nzOkText: 'Cerrar sesión',
      nzCancelText: 'Cancelar',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.navigationService.handleLogout();
      }
    });
  }

  /**
   * Descarga los datos del usuario
   */
  downloadUserData(): void {
    this.loadingSignal.set(true);
    
    try {
      const user = this.user();
      if (user) {
        const userData = {
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          roles: user.roles,
          permissions: user.permissions,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `datos_usuario_${user.username}.json`;
        link.click();
        
        window.URL.revokeObjectURL(url);
        this.message.success('Datos descargados exitosamente');
      }
    } catch (error) {
      console.error('Error al descargar datos:', error);
      this.message.error('Error al descargar los datos');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Solicita eliminación de cuenta (placeholder)
   */
  requestAccountDeletion(): void {
    this.modal.error({
      nzTitle: 'Eliminar cuenta',
      nzContent: 'Para eliminar tu cuenta, contacta al administrador del sistema. Esta función no está disponible para autoservicio por motivos de seguridad.',
      nzOkText: 'Entendido'
    });
  }

  /**
   * Limpia la caché del navegador
   */
  clearCache(): void {
    this.modal.confirm({
      nzTitle: 'Limpiar caché',
      nzContent: 'Esta acción limpiará todos los datos almacenados localmente (excepto la sesión actual). ¿Continuar?',
      nzOkText: 'Limpiar',
      nzCancelText: 'Cancelar',
      nzOnOk: () => {
        try {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            // Guardar datos esenciales antes de limpiar
            const token = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            const user = localStorage.getItem('current_user');
            
            // Limpiar todo
            localStorage.clear();
            
            // Restaurar datos esenciales
            if (token) localStorage.setItem('access_token', token);
            if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
            if (user) localStorage.setItem('current_user', user);
            
            this.message.success('Caché limpiada exitosamente');
          }
        } catch (error) {
          console.error('Error al limpiar caché:', error);
          this.message.error('Error al limpiar la caché');
        }
      }
    });
  }

  /**
   * Obtiene la información de la sesión actual
   */
  getSessionInfo(): any {
    const user = this.user();
    if (user) {
      return {
        usuario: user.username,
        email: user.email,
        roles: user.roles?.join(', ') || user.role || 'Sin rol',
        ultimoAcceso: user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-ES') : 'Nunca',
        cuentaCreada: user.createdAt ? new Date(user.createdAt).toLocaleString('es-ES') : 'Fecha no disponible',
        estado: user.active ? 'Activa' : 'Inactiva'
      };
    }
    return null;
  }

}
