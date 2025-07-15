import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { AuthService } from '../../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RegisterRequest } from '../../../../core/models/auth.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzStepsModule,
    ErrorMessageComponent
  ],
  standalone: true
})
export class RegisterComponent {
  readonly currentYear = new Date().getFullYear();

  registerForm: FormGroup;
  currentStep = signal(0);
  passwordVisible = signal(false);
  confirmPasswordVisible = signal(false);
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(NzMessageService);

  // Computed signals
  readonly loading = computed(() => this.authService.loading());
  readonly error = computed(() => this.authService.error());

  // Regex que coincide exactamente con el backend
  private readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

  // Pasos del registro
  readonly steps = [
    {
      title: 'Información Personal',
      description: 'Datos básicos',
      fields: ['firstName', 'lastName', 'email']
    },
    {
      title: 'Credenciales',
      description: 'Usuario y contraseña',
      fields: ['username', 'password', 'confirmPassword']
    },
    {
      title: 'Confirmación',
      description: 'Revisar datos',
      fields: []
    }
  ];

  constructor() {
    this.registerForm = this.createRegisterForm();
  }

  /**
   * Crea el formulario de registro con validaciones que coinciden con el backend
   */
  private createRegisterForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(this.PASSWORD_REGEX)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador para confirmar que las contraseñas coincidan
   */
  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Avanza al siguiente paso validando campos
   */
  nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.currentStep.update(step => Math.min(step + 1, this.steps.length - 1));
    } else {
      this.markCurrentStepTouched();
    }
  }

  /**
   * Retrocede al paso anterior
   */
  previousStep(): void {
    this.currentStep.update(step => Math.max(step - 1, 0));
  }

  /**
   * Verifica si el paso actual es válido
   */
  private isCurrentStepValid(): boolean {
    const currentStepFields = this.steps[this.currentStep()].fields;
    
    if (currentStepFields.length === 0) return true;

    return currentStepFields.every(field => {
      const control = this.registerForm.get(field);
      return control?.valid;
    });
  }

  /**
   * Marca los campos del paso actual como tocados para mostrar errores
   */
  private markCurrentStepTouched(): void {
    const currentStepFields = this.steps[this.currentStep()].fields;
    
    currentStepFields.forEach(field => {
      const control = this.registerForm.get(field);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  /**
   * Maneja el envío del formulario con mejor manejo de errores
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.clearError();
      
      const registerData: RegisterRequest = {
        firstName: this.registerForm.value.firstName.trim(),
        lastName: this.registerForm.value.lastName.trim(),
        email: this.registerForm.value.email.trim().toLowerCase(),
        username: this.registerForm.value.username.trim(),
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword
      };

      this.authService.register(registerData).subscribe({
        next: (user) => {
          this.messageService.success('Registro exitoso. Por favor, inicia sesión.');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Error en registro:', error);
          
          // Manejo específico para errores de validación del backend
          if (error.status === 400 && error.error?.errors) {
            const backendErrors = error.error.errors;
            this.handleBackendValidationErrors(backendErrors);
          } else {
            // Error genérico
            const errorMessage = error.error?.message || 'Error inesperado durante el registro';
            this.messageService.error(errorMessage);
          }
        }
      });
    } else {
      this.markFormGroupTouched();
      this.messageService.warning('Por favor, complete todos los campos correctamente');
    }
  }

  /**
   * Maneja errores de validación del backend
   */
  private handleBackendValidationErrors(errors: any[]): void {
    errors.forEach(error => {
      const field = error.field;
      const message = error.defaultMessage;
      
      if (this.registerForm.get(field)) {
        // Agregar error personalizado al control
        this.registerForm.get(field)?.setErrors({ 
          backendError: { message } 
        });
      }
    });
    
    // Volver al paso que contiene el error
    this.goToStepWithError();
  }

  /**
   * Navega al paso que contiene errores
   */
  private goToStepWithError(): void {
    for (let i = 0; i < this.steps.length - 1; i++) {
      const stepFields = this.steps[i].fields;
      const hasError = stepFields.some(field => {
        const control = this.registerForm.get(field);
        return control?.invalid;
      });
      
      if (hasError) {
        this.currentStep.set(i);
        this.markCurrentStepTouched();
        break;
      }
    }
  }

  /**
   * Marca todos los campos como tocados
   */
  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
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
   * Toggle para mostrar/ocultar confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible.update(visible => !visible);
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    // Error del backend tiene prioridad
    if (field?.hasError('backendError')) {
      return field.errors?.['backendError']?.message;
    }
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    if (field?.hasError('email')) {
      return 'Formato de email inválido';
    }
    
    if (field?.hasError('pattern')) {
      if (fieldName === 'username') {
        return 'Solo letras, números y guión bajo permitidos';
      }
      if (fieldName === 'password') {
        return 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial (@$!%*?&)';
      }
    }
    
    if (fieldName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    
    return '';
  }

  /**
   * Obtiene la etiqueta del campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Email',
      username: 'Usuario',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Obtiene la fortaleza de la contraseña basada en las mismas reglas del backend
   */
  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';
    
    if (password.length === 0) return '';
    
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumeric = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    const hasMinLength = password.length >= 8;
    
    const validCriteria = [hasLowerCase, hasUpperCase, hasNumeric, hasSpecialChar, hasMinLength];
    const score = validCriteria.filter(criteria => criteria).length;
    
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  }

  /**
   * Navega al login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Limpia el error de autenticación
   */
  onErrorClose(): void {
    this.authService.clearError();
  }

  /**
   * Obtiene el estado del paso para el indicador visual
   */
  getStepStatus(stepIndex: number): string {
    const currentStep = this.currentStep();
    
    if (stepIndex < currentStep) {
      // Verificar si el paso completado tiene errores
      const stepFields = this.steps[stepIndex].fields;
      const hasErrors = stepFields.some(field => {
        const control = this.registerForm.get(field);
        return control?.invalid;
      });
      return hasErrors ? 'error' : 'finish';
    }
    
    if (stepIndex === currentStep) {
      return 'process';
    }
    
    return 'wait';
  }

  /**
   * Métodos para verificar criterios específicos de contraseña
   */
  passwordHasLowercase(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[a-z]/.test(password);
  }

  passwordHasUppercase(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[A-Z]/.test(password);
  }

  passwordHasNumber(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /\d/.test(password);
  }

  passwordHasSpecialChar(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[@$!%*?&]/.test(password);
  }

  passwordHasMinLength(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return password.length >= 8;
  }
}