import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzResultModule } from 'ng-zorro-antd/result';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { AuthService } from '../../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
   imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzResultModule,
    ErrorMessageComponent
  ],
  standalone: true
})
export class ForgotPasswordComponent  {
  readonly currentYear = new Date().getFullYear();

 forgotPasswordForm: FormGroup;
  emailSent = signal(false);
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(NzMessageService);

  // Computed signals
  readonly loading = computed(() => this.authService.loading());
  readonly error = computed(() => this.authService.error());

  constructor() {
    this.forgotPasswordForm = this.createForgotPasswordForm();
  }

  /**
   * Crea el formulario de recuperación
   */
  private createForgotPasswordForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.authService.clearError();
      
      const email = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.emailSent.set(true);
          this.messageService.success('Instrucciones enviadas a tu correo');
        },
        error: (error) => {
          console.error('Error al solicitar recuperación:', error);
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
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Email es requerido';
    }
    
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    
    return '';
  }

  /**
   * Navega al login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Reenvía el email
   */
  resendEmail(): void {
    this.emailSent.set(false);
    this.onSubmit();
  }

  /**
   * Limpia el error de autenticación
   */
  onErrorClose(): void {
    this.authService.clearError();
  }

}
