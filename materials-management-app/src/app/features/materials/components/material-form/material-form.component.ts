import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Material } from '../../../../core/models/material.model';
import { MaterialStatus } from '../../../../core/models/material-status.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from '../../../../core/services/material.service';
import { CityService } from '../../../../core/services/city.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-material-form',
  templateUrl: './material-form.component.html',
  styleUrls: ['./material-form.component.scss'],
    standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzSpinModule
  ],
})
export class MaterialFormComponent implements OnInit {

  materialForm: FormGroup;
  
  // Signals para el estado del componente
  private loadingSignal = signal(false);
  private submittingSignal = signal(false);
  private currentMaterialSignal = signal<Material | null>(null);
  private isEditModeSignal = signal(false);

  // Input signals (para modo edición)
  materialId = input<number | null>(null);

  // Computed signals
  readonly loading = computed(() => this.loadingSignal());
  readonly submitting = computed(() => this.submittingSignal());
  readonly currentMaterial = computed(() => this.currentMaterialSignal());
  readonly isEditMode = computed(() => this.isEditModeSignal());
  readonly cities = computed(() => this.cityService.cities());
  readonly departments = computed(() => this.cityService.departments());
  readonly citiesLoading = computed(() => this.cityService.loading());

  // Opciones estáticas
  readonly materialTypes = [
    'ELECTRONICO',
    'MECANICO', 
    'QUIMICO',
    'TEXTIL',
    'CONSTRUCCION',
    'HERRAMIENTA',
    'OFICINA'
  ];
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private materialService = inject(MaterialService);
  private cityService = inject(CityService);
  private messageService = inject(NzMessageService);

  readonly materialStatuses = [
    { value: MaterialStatus.ACTIVE, label: 'Activo' },
    { value: MaterialStatus.AVAILABLE, label: 'Disponible' },
    { value: MaterialStatus.ASSIGNED, label: 'Asignado' }
  ];

  constructor(
  ) {
    this.materialForm = this.createMaterialForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.checkEditMode();
  }

  /**
   * Crea el formulario de material con validaciones
   */
  private createMaterialForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      type: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      purchaseDate: [new Date(), [Validators.required]],
      saleDate: [null],
      status: [MaterialStatus.ACTIVE, [Validators.required]],
      departmentCode: ['', [Validators.required]],
      cityCode: ['', [Validators.required]]
    });
  }

  /**
   * Carga los datos iniciales necesarios
   */
  private loadInitialData(): void {
    this.cityService.getAllCities().subscribe();
    this.cityService.getAllDepartments().subscribe();
  }

  /**
   * Verifica si estamos en modo edición
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditModeSignal.set(true);
      this.loadMaterialForEdit(+id);
    }
  }

  /**
   * Carga el material para edición
   */
  private loadMaterialForEdit(id: number): void {
    this.loadingSignal.set(true);
    
    // Simular carga del material (implementar según tu API)
    // Aquí deberías tener un método getMaterialById en el servicio
    setTimeout(() => {
      // Material simulado para demo
      const material: Material = {
        id: id,
        name: 'Material de prueba',
        description: 'Descripción del material de prueba',
        type: 'ELECTRONICO',
        price: 150000,
        purchaseDate: new Date('2024-01-15'),
        saleDate: undefined,
        status: MaterialStatus.AVAILABLE,
        city: {
          code: 'BOG',
          name: 'Bogotá',
          department: { code: 'DC', name: 'Distrito Capital' }
        }
      };
      
      this.currentMaterialSignal.set(material);
      this.populateForm(material);
      this.loadingSignal.set(false);
    }, 1000);
  }

  /**
   * Llena el formulario con datos del material
   */
  private populateForm(material: Material): void {
    this.materialForm.patchValue({
      name: material.name,
      description: material.description,
      type: material.type,
      price: material.price,
      purchaseDate: material.purchaseDate,
      saleDate: material.saleDate,
      status: material.status,
      departmentCode: material.city.department.code,
      cityCode: material.city.code
    });
  }

  /**
   * Maneja el cambio de departamento
   */
  onDepartmentChange(departmentCode: string): void {
    // Limpiar la ciudad seleccionada cuando cambia el departamento
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
   * Valida las fechas (compra no puede ser mayor a venta)
   */
  validateDates(): void {
    const purchaseDate = this.materialForm.get('purchaseDate')?.value;
    const saleDate = this.materialForm.get('saleDate')?.value;
    
    if (purchaseDate && saleDate && new Date(purchaseDate) > new Date(saleDate)) {
      this.materialForm.get('saleDate')?.setErrors({ 
        invalidDate: 'La fecha de venta no puede ser anterior a la fecha de compra' 
      });
    }
  }

  /**
   * Envía el formulario
   */
  onSubmit(): void {
    if (this.materialForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
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

    // Buscar la ciudad seleccionada
    const selectedCity = this.cities().find(city => city.code === formValue.cityCode);
    if (!selectedCity) {
      this.messageService.error('Ciudad no válida');
      this.submittingSignal.set(false);
      return;
    }

    const materialData: Material = {
      name: formValue.name,
      description: formValue.description,
      type: formValue.type,
      price: formValue.price,
      purchaseDate: formValue.purchaseDate,
      saleDate: formValue.saleDate,
      status: formValue.status,
      city: selectedCity
    };

    if (this.isEditMode()) {
      this.updateMaterial(materialData);
    } else {
      this.createMaterial(materialData);
    }
  }

  /**
   * Crea un nuevo material
   */
  private createMaterial(material: Material): void {
    this.materialService.createMaterial(material).subscribe({
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
   * Actualiza un material existente
   */
  private updateMaterial(material: Material): void {
    const id = this.currentMaterial()?.id;
    if (!id) {
      this.messageService.error('ID de material no válido');
      this.submittingSignal.set(false);
      return;
    }

    this.materialService.updateMaterial(id, material).subscribe({
      next: (updatedMaterial) => {
        this.messageService.success('Material actualizado exitosamente');
        this.router.navigate(['/materials']);
      },
      error: (error) => {
        this.messageService.error('Error al actualizar el material');
        console.error('Error:', error);
        this.submittingSignal.set(false);
      }
    });
  }

  /**
   * Cancela la operación y regresa a la lista
   */
  onCancel(): void {
    this.router.navigate(['/materials']);
  }

  /**
   * Resetea el formulario
   */
  onReset(): void {
    if (this.isEditMode() && this.currentMaterial()) {
      this.populateForm(this.currentMaterial()!);
    } else {
      this.materialForm.reset();
      this.materialForm.patchValue({
        purchaseDate: new Date(),
        status: MaterialStatus.ACTIVE,
        price: 0
      });
    }
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
}