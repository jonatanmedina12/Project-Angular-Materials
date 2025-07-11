import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { AuthService } from '../../../../core/services/auth.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NavigationService } from '../../../../core/guards/navigation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
   imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzAlertModule,
    NzCardModule,
    NzDividerModule,
    NzSpinModule,
    ErrorMessageComponent
  ],
  standalone: true
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private navigationService = inject(NavigationService);
  private fb = inject(FormBuilder);

  // Signals para el estado del componente
  private passwordVisibleSignal = signal<boolean>(false);
  private submittingSignal = signal<boolean>(false);

  // Form
  loginForm!: FormGroup;

  // Computed signals
  readonly loading = computed(() => this.authService.loading() || this.submittingSignal());
  readonly error = computed(() => this.authService.error());
  readonly passwordVisible = computed(() => this.passwordVisibleSignal());
  readonly isInitializing = computed(() => this.navigationService.isInitializing());
  readonly currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Inicializa el formulario reactivo
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.loading()) {
      this.performLogin();
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Realiza el login
   */
  private performLogin(): void {
    this.submittingSignal.set(true);
    this.authService.clearError();

    const credentials = {
      usernameOrEmail: this.loginForm.get('usernameOrEmail')?.value,
      password: this.loginForm.get('password')?.value,
      remember: this.loginForm.get('remember')?.value
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response.user.firstName);
        this.navigationService.handleSuccessfulLogin();
        this.submittingSignal.set(false);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.submittingSignal.set(false);
        // El error se maneja automáticamente en el servicio
      }
    });
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(field => {
      const control = this.loginForm.get(field);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  /**
   * Verifica si un campo tiene error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtiene el mensaje de error de un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.errors?.['required']) {
      return `${fieldName === 'usernameOrEmail' ? 'Usuario' : 'Contraseña'} es requerido`;
    }
    
    if (field?.errors?.['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }
    
    return '';
  }

  /**
   * Verifica si el formulario es válido
   */
  isFormValid(): boolean {
    return this.loginForm.valid;
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.passwordVisibleSignal.update(visible => !visible);
  }

  /**
   * Cierra el mensaje de error
   */
  onErrorClose(): void {
    this.authService.clearError();
  }

  /**
   * Navega al registro
   */
  goToRegister(): void {
    this.navigationService.navigateTo('/auth/register');
  }

  /**
   * Navega a forgot password
   */
  goToForgotPassword(): void {
    this.navigationService.navigateTo('/auth/forgot-password');
  }
}
