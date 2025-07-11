import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoginRequest } from '../../../../core/models/auth.model';
import { NzSpinModule } from 'ng-zorro-antd/spin';

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
 // Signals para estado del componente
  readonly passwordVisible = signal(false);
  readonly isInitializing = signal(true);
  readonly loginForm: FormGroup;
  
  // Servicios inyectados
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(NzMessageService);

  // Computed signals para estado reactivo
  readonly loading = computed(() => this.authService.loading());
  readonly error = computed(() => this.authService.error());
  readonly isFormValid = computed(() => this.loginForm?.valid ?? false);
  readonly currentYear = new Date().getFullYear();

  constructor() {
    this.loginForm = this.createLoginForm();
    this.setupAuthenticationEffect();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Inicializa el componente verificando el estado de autenticación
   */
  private initializeComponent(): void {
    // Verificar autenticación inicial
    this.authService.isAuthenticatedAsync().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.redirectToReturnUrl();
        } else {
          this.isInitializing.set(false);
        }
      },
      error: () => {
        this.isInitializing.set(false);
      }
    });
  }

  /**
   * Configura el effect para manejar cambios en la autenticación
   */
  private setupAuthenticationEffect(): void {
    effect(() => {
      if (this.authService.isAuthenticated() && !this.isInitializing()) {
        this.redirectToReturnUrl();
      }
    });
  }

  /**
   * Crea el formulario de login con validaciones
   */
  private createLoginForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  /**
   * Maneja el envío del formulario de login
   */
  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.authService.clearError();
    
    const loginData: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(loginData).subscribe({
      next: () => {
        this.messageService.success('¡Bienvenido! Inicio de sesión exitoso');
        this.redirectToReturnUrl();
      },
      error: (error) => {
        console.error('Error en login:', error);
        // El error se maneja automáticamente en el servicio
      }
    });
  }

  /**
   * Redirige a la URL de retorno o al dashboard
   */
  private redirectToReturnUrl(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/materials';
    this.router.navigate([returnUrl]);
  }

  /**
   * Marca todos los campos del formulario como tocados
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  togglePasswordVisibility(): void {
    this.passwordVisible.update(visible => !visible);
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${fieldName === 'username' ? 'Usuario' : 'Contraseña'} es requerido`;
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    return '';
  }

  /**
   * Navega al registro
   */
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Navega a recuperar contraseña
   */
  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Limpia el error de autenticación
   */
  onErrorClose(): void {
    this.authService.clearError();
  }
}
