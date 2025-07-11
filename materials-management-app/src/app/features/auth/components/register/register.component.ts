import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
export class RegisterComponent  {
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
   * Crea el formulario de registro
   */
  private createRegisterForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador personalizado para la fortaleza de contraseña
   */
  private passwordStrengthValidator(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const isValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
    return isValid ? null : { passwordStrength: true };
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
   * Avanza al siguiente paso
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
   * Marca los campos del paso actual como tocados
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
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.clearError();
      
      const registerData: RegisterRequest = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        username: this.registerForm.value.username,
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
        }
      });
    } else {
      this.markFormGroupTouched();
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
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    
    if (field?.hasError('pattern') && fieldName === 'username') {
      return 'Solo letras, números y guión bajo';
    }
    
    if (field?.hasError('passwordStrength')) {
      return 'Debe contener mayúscula, minúscula, número y carácter especial';
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
   * Obtiene la fortaleza de la contraseña
   */
  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';
    
    if (password.length === 0) return '';
    
    let score = 0;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    if (password.length >= 8) score++;
    
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

}
