import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MaterialStatus } from '../../../../core/models/material-status.enum';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { Router } from '@angular/router';
import { MaterialService } from '../../../../core/services/material.service';
import { CityService } from '../../../../core/services/city.service';
import { NzMessageService } from 'ng-zorro-antd/message';

interface MaterialRequestDto {
  name: string;
  description: string;
  type: string;
  price: number;
  purchaseDate: string;
  saleDate?: string | null;
  status: MaterialStatus;
  cityCode: string;
}

@Component({
  selector: 'app-material-create-page',
  templateUrl: './material-create-page.component.html',
  styleUrls: ['./material-create-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzSpinModule,
    NzStepsModule
  ]
})
export class MaterialCreatePageComponent implements OnInit {

  materialForm: FormGroup;
  
  // Signals para el estado del componente
  private submittingSignal = signal(false);
  private currentStepSignal = signal(0);

  // Servicios inyectados
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private materialService = inject(MaterialService);
  private cityService = inject(CityService);
  private messageService = inject(NzMessageService);
  readonly selectedMaterialType = computed(() => {
  const typeValue = this.materialForm.get('type')?.value;
  return this.materialTypes.find(t => t.value === typeValue)?.label || 'No especificado';
});

readonly selectedCity = computed(() => {
  const cityCode = this.materialForm.get('cityCode')?.value;
  return this.getFilteredCities().find(c => c.code === cityCode)?.name || 'No especificada';
});

readonly selectedStatus = computed(() => {
  const statusValue = this.materialForm.get('status')?.value;
  return this.materialStatuses.find(s => s.value === statusValue)?.label || 'No especificado';
});
  // Computed signals
  readonly submitting = computed(() => this.submittingSignal());
  readonly currentStep = computed(() => this.currentStepSignal());
  readonly cities = computed(() => this.cityService.cities());
  readonly departments = computed(() => this.cityService.departments());
  readonly citiesLoading = computed(() => this.cityService.loading());

  // Opciones estáticas
  readonly materialTypes = [
    { value: 'ELECTRONICO', label: 'Electrónico' },
    { value: 'MECANICO', label: 'Mecánico' },
    { value: 'QUIMICO', label: 'Químico' },
    { value: 'TEXTIL', label: 'Textil' },
    { value: 'CONSTRUCCION', label: 'Construcción' },
    { value: 'HERRAMIENTA', label: 'Herramienta' },
    { value: 'OFICINA', label: 'Oficina' }
  ];

  readonly materialStatuses = [
    { value: MaterialStatus.ACTIVE, label: 'Activo' },
    { value: MaterialStatus.AVAILABLE, label: 'Disponible' },
    { value: MaterialStatus.ASSIGNED, label: 'Asignado' }
  ];

  readonly steps = [
    {
      title: 'Información Básica',
      description: 'Nombre, tipo y descripción',
      icon: 'info-circle'
    },
    {
      title: 'Detalles Financieros',
      description: 'Precio y fechas',
      icon: 'dollar'
    },
    {
      title: 'Ubicación y Estado',
      description: 'Ciudad y estado del material',
      icon: 'environment'
    }
  ];

  constructor() {
    this.materialForm = this.createMaterialForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Crea el formulario de material con validaciones
   */
  private createMaterialForm(): FormGroup {
    return this.fb.group({
      // Paso 1: Información básica
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      type: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      
      // Paso 2: Información financiera
      price: [0, [Validators.required, Validators.min(0.01)]],
      purchaseDate: [new Date(), [Validators.required]],
      saleDate: [null],
      
      // Paso 3: Ubicación y estado
      departmentCode: ['', [Validators.required]],
      cityCode: ['', [Validators.required]],
      status: [MaterialStatus.ACTIVE, [Validators.required]]
    });
  }

  /**
   * Carga los datos iniciales necesarios
   */
  private loadInitialData(): void {
    this.cityService.getAllCities().subscribe({
      next: (cities) => {
        console.log(`${cities.length} ciudades cargadas`);
      },
      error: (error) => {
        this.messageService.error('Error al cargar ciudades');
        console.error('Error:', error);
      }
    });

    this.cityService.getAllDepartments().subscribe({
      next: (departments) => {
        console.log(`${departments.length} departamentos cargados`);
      },
      error: (error) => {
        this.messageService.error('Error al cargar departamentos');
        console.error('Error:', error);
      }
    });
  }

  /**
   * Navega al siguiente paso
   */
  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStepSignal.update(step => Math.min(step + 1, this.steps.length - 1));
    }
  }

  /**
   * Navega al paso anterior
   */
  previousStep(): void {
    this.currentStepSignal.update(step => Math.max(step - 1, 0));
  }

  /**
   * Valida el paso actual
   */
  private validateCurrentStep(): boolean {
    const currentStep = this.currentStep();
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['name', 'type', 'description'];
        break;
      case 1:
        fieldsToValidate = ['price', 'purchaseDate'];
        break;
      case 2:
        fieldsToValidate = ['departmentCode', 'cityCode', 'status'];
        break;
    }

    let isValid = true;
    fieldsToValidate.forEach(field => {
      const control = this.materialForm.get(field);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          isValid = false;
        }
      }
    });

    if (!isValid) {
      this.messageService.warning('Por favor complete todos los campos requeridos');
    }

    // Validar fechas en el paso 2
    if (currentStep === 1) {
      this.validateDates();
      if (this.materialForm.get('saleDate')?.errors) {
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Maneja el cambio de departamento
   */
  onDepartmentChange(departmentCode: string): void {
    this.materialForm.patchValue({ cityCode: null });
  }

  /**
   * Obtiene las ciudades filtradas por departamento
   */
  getFilteredCities() {
    const departmentCode = this.materialForm.get('departmentCode')?.value;
    if (!departmentCode) {
      return this.cities();
    }
    
    return this.cities().filter(city => 
      city.department.code === departmentCode
    );
  }

  /**
   * Valida las fechas
   */
  validateDates(): void {
    const purchaseDate = this.materialForm.get('purchaseDate')?.value;
    const saleDate = this.materialForm.get('saleDate')?.value;
    
    if (purchaseDate && saleDate && new Date(purchaseDate) > new Date(saleDate)) {
      this.materialForm.get('saleDate')?.setErrors({ 
        invalidDate: 'La fecha de venta no puede ser anterior a la fecha de compra' 
      });
    } else {
      // Limpiar error si las fechas son válidas
      const saleDateControl = this.materialForm.get('saleDate');
      if (saleDateControl?.errors?.['invalidDate']) {
        delete saleDateControl.errors['invalidDate'];
        if (Object.keys(saleDateControl.errors).length === 0) {
          saleDateControl.setErrors(null);
        }
      }
    }
  }

  /**
   * Envía el formulario para crear el material
   */
  onSubmit(): void {
  if (this.materialForm.invalid) {
    Object.keys(this.materialForm.controls).forEach(key => {
      this.materialForm.get(key)?.markAsTouched();
    });
    this.messageService.warning('Por favor complete todos los campos requeridos');
    return;
  }

  this.validateDates();
  if (this.materialForm.get('saleDate')?.errors) {
    return;
  }

  this.submittingSignal.set(true);
  const formValue = this.materialForm.value;

  // Preparar datos para el servicio usando MaterialRequestDto
  const materialData: MaterialRequestDto = {
    name: formValue.name,
    description: formValue.description,
    type: formValue.type,
    price: formValue.price,
    purchaseDate: formValue.purchaseDate instanceof Date
      ? formValue.purchaseDate.toISOString().split('T')[0]
      : formValue.purchaseDate,
    saleDate: formValue.saleDate
      ? (formValue.saleDate instanceof Date
        ? formValue.saleDate.toISOString().split('T')[0]
        : formValue.saleDate)
      : null,
    status: formValue.status,
    cityCode: formValue.cityCode
  };

  this.createMaterial(materialData);
}
  readonly formattedPrice = computed(() => {
    const price = this.materialForm.get('price')?.value || 0;
    return this.priceFormatter(price);
  });
  /**
   * Crea el material llamando al servicio
   */
  private createMaterial(materialData: MaterialRequestDto): void {
  this.materialService.createMaterial(materialData).subscribe({
    next: (createdMaterial) => {
      this.messageService.success('Material creado exitosamente');
      this.router.navigate(['/materials']);
    },
    error: (error) => {
      this.messageService.error('Error al crear el material');
      console.error('Error:', error);
      this.submittingSignal.set(false);
    }
  });
}


  /**
   * Cancela la creación y regresa a la lista
   */
  onCancel(): void {
    this.router.navigate(['/materials']);
  }

  /**
   * Resetea el formulario
   */
  onReset(): void {
    this.materialForm.reset();
    this.materialForm.patchValue({
      purchaseDate: new Date(),
      status: MaterialStatus.ACTIVE,
      price: 0
    });
    this.currentStepSignal.set(0);
    this.messageService.info('Formulario reseteado');
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.materialForm.get(fieldName);
    if (field?.errors && field.touched) {
      const errors = field.errors;
      
      if (errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
      if (errors['invalidDate']) return errors['invalidDate'];
    }
    return '';
  }

  /**
   * Obtiene la etiqueta de un campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre',
      description: 'Descripción',
      type: 'Tipo',
      price: 'Precio',
      purchaseDate: 'Fecha de compra',
      saleDate: 'Fecha de venta',
      status: 'Estado',
      departmentCode: 'Departamento',
      cityCode: 'Ciudad'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Verifica si un campo tiene error
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.materialForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Formateador para el campo de precio
   */
  priceFormatter = (value: number): string => {
    return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  /**
   * Parser para el campo de precio
   */
  priceParser(value: string): string {
    return value.replace(/[^0-9.]/g, '');
  }

  /**
   * Verifica si se puede avanzar al siguiente paso
   */
  canGoNext(): boolean {
    const currentStep = this.currentStep();
    return currentStep < this.steps.length - 1;
  }

  /**
   * Verifica si se puede retroceder
   */
  canGoPrevious(): boolean {
    return this.currentStep() > 0;
  }
}