import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserService } from '../../../core/services/user.service';
import { ChangePassword } from '../../../core/models/change-password';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
   imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzTabsModule
  ],
  standalone: true
})
export class ProfileComponent  {


   private authService = inject(AuthService);
   private usersService = inject(UserService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);

  // Signals para el estado del componente
  private loadingSignal = signal(false);
  private passwordLoadingSignal = signal(false);
  
  // Computed signals
  readonly loading = computed(() => this.loadingSignal());
  readonly passwordLoading = computed(() => this.passwordLoadingSignal());
  readonly user = computed(() => this.authService.user());

  // Formularios
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  constructor() {
    this.initializeForms();
    this.loadUserData();
  }

  /**
   * Inicializa los formularios
   */
private initializeForms(): void {
  this.profileForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]]
  });

  this.passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, this.passwordStrengthValidator]],
    confirmNewPassword: ['', [Validators.required]] // Cambiar nombre del campo
  }, { validators: this.passwordMatchValidator });
}


  /**
   * Carga los datos del usuario en el formulario
   */
  private loadUserData(): void {
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    }
  }

  /**
   * Validador personalizado para confirmar contraseña
   */
private passwordMatchValidator(group: FormGroup) {
  const password = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmNewPassword')?.value; // Cambiar nombre
  
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  
  return null;
}

  /**
   * Actualiza el perfil del usuario
   */
  updateProfile(): void {
  if (this.profileForm.valid) {
    this.loadingSignal.set(true);
    
    const profileData = this.profileForm.value;
    
    this.usersService.updateProfile(profileData).subscribe({
      next: (updatedUser) => {
        this.message.success('Perfil actualizado exitosamente');
        // No necesitas recargar manualmente, el signal se actualiza automáticamente
        // this.loadUserData(); // Remover esta línea
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.message.error(error.error?.message || 'Error al actualizar el perfil');
      },
      complete: () => {
        this.loadingSignal.set(false);
      }
    });
  } else {
    this.markFormGroupTouched(this.profileForm);
  }
}

  /**
   * Cambia la contraseña del usuario
   */
 changePassword(): void {
  if (this.passwordForm.valid) {
    this.passwordLoadingSignal.set(true);
    
    const passwordData: ChangePassword = this.passwordForm.value;
    
    this.usersService.changePassword(passwordData).subscribe({
      next: () => {
        this.message.success('Contraseña cambiada exitosamente');
        this.passwordForm.reset();
        this.passwordLoadingSignal.set(false); // Agregar aquí también
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);
        // Verificar si el error tiene la estructura esperada
        const errorMessage = error.error?.message || error.message || 'Error al cambiar la contraseña';
        this.message.error(errorMessage);
        this.passwordLoadingSignal.set(false); // Agregar aquí para asegurar que se deshabilite
      },
      complete: () => {
        this.passwordLoadingSignal.set(false); // También aquí por si acaso
      }
    });
  } else {
    this.markFormGroupTouched(this.passwordForm);
  }
}

  /**
   * Marca todos los campos de un formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verifica si un campo del formulario de perfil tiene errores
   */
  isProfileFieldInvalid(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Verifica si un campo del formulario de contraseña tiene errores
   */
  isPasswordFieldInvalid(field: string): boolean {
    const control = this.passwordForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo del perfil
   */
  getProfileFieldError(field: string): string {
    const control = this.profileForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return `${field} es obligatorio`;
      if (control.errors['email']) return 'Formato de email inválido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  /**
   * Obtiene el mensaje de error para un campo de contraseña
   */
getPasswordFieldError(field: string): string {
  const control = this.passwordForm.get(field);
  if (control?.errors) {
    if (control.errors['required']) return 'Este campo es obligatorio';
    
    // Errores específicos de fuerza de contraseña
    if (field === 'newPassword') {
      if (control.errors['tooShort']) return 'La contraseña debe tener al menos 8 caracteres';
      if (control.errors['tooLong']) return 'La contraseña no puede exceder 100 caracteres';
      if (control.errors['missingLowercase']) return 'Debe contener al menos una letra minúscula';
      if (control.errors['missingUppercase']) return 'Debe contener al menos una letra mayúscula';
      if (control.errors['missingNumber']) return 'Debe contener al menos un número';
      if (control.errors['missingSpecialChar']) return 'Debe contener al menos un carácter especial (@$!%*?&)';
    }
  }
  
  // Error de confirmación de contraseña - actualizar nombre del campo
  if (field === 'confirmNewPassword' && this.passwordForm.errors?.['passwordMismatch']) {
    return 'Las contraseñas no coinciden';
  }
  
  return '';
}
/**
 * Validador de fuerza de contraseña
 */
private passwordStrengthValidator(control: any) {
  const password = control.value;
  if (!password) return null;

  const errors: any = {};
  
  // Validaciones específicas
  if (!/(?=.*[a-z])/.test(password)) {
    errors.missingLowercase = true;
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.missingUppercase = true;
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.missingNumber = true;
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.missingSpecialChar = true;
  }
  if (password.length < 8) {
    errors.tooShort = true;
  }
  if (password.length > 100) {
    errors.tooLong = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
/**
 * Calcula la fuerza de la contraseña
 */
getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: '', color: '', suggestions: [] };
  }

  let score = 0;
  const suggestions: string[] = [];

  // Verificar longitud
  if (password.length >= 8) score += 1;
  else suggestions.push('Debe tener al menos 8 caracteres');

  // Verificar minúscula
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('Agregar al menos una letra minúscula');

  // Verificar mayúscula
  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('Agregar al menos una letra mayúscula');

  // Verificar número
  if (/\d/.test(password)) score += 1;
  else suggestions.push('Agregar al menos un número');

  // Verificar carácter especial
  if (/[@$!%*?&]/.test(password)) score += 1;
  else suggestions.push('Agregar al menos un carácter especial (@$!%*?&)');

  // Determinar etiqueta y color
  let label = '';
  let color = '';

  switch (score) {
    case 0:
    case 1:
      label = 'Muy débil';
      color = '#ff4d4f';
      break;
    case 2:
      label = 'Débil';
      color = '#ff7a45';
      break;
    case 3:
      label = 'Regular';
      color = '#ffa940';
      break;
    case 4:
      label = 'Fuerte';
      color = '#52c41a';
      break;
    case 5:
      label = 'Muy fuerte';
      color = '#389e0d';
      break;
  }

  return { score, label, color, suggestions };
}
/**
 * Obtiene la fuerza de la contraseña actual
 */
getCurrentPasswordStrength(): PasswordStrength {
  const password = this.passwordForm.get('newPassword')?.value || '';
  return this.getPasswordStrength(password);
}


  /**
   * Obtiene los roles del usuario como string
   */
  getUserRoles(): string {
    const user = this.user();
    if (user?.roles && user.roles.length > 0) {
      return user.roles.join(', ');
    }
    return user?.role || 'Sin rol asignado';
  }

  /**
   * Formatea la fecha de último login
   */
  getLastLoginFormatted(): string {
    const user = this.user();
    if (user?.lastLogin) {
      return new Date(user.lastLogin).toLocaleString('es-ES');
    }
    return 'Nunca';
  }

  /**
   * Formatea la fecha de creación de cuenta
   */
  getCreatedAtFormatted(): string {
    const user = this.user();
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleString('es-ES');
    }
    return 'Fecha no disponible';
  }

}
