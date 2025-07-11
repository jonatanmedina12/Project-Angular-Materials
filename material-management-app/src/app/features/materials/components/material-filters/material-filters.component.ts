import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CityService } from '../../../../core/services/city.service';
import { MaterialService } from '../../../../core/services/material.service';
import { MaterialFilters } from '../../../../core/models/material-filters.model';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-material-filters',
  templateUrl: './material-filters.component.html',
  styleUrls: ['./material-filters.component.scss'],
   imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzCollapseModule,
    NzTagModule
  ],
  standalone: true
})
export class MaterialFiltersComponent implements OnInit {

   filterForm: FormGroup;
  
  // Signals para datos de selección
  private materialTypesSignal = signal<string[]>([
    'ELECTRONICO',
    'MECANICO', 
    'QUIMICO',
    'TEXTIL',
    'CONSTRUCCION',
    'HERRAMIENTA',
    'OFICINA'
  ]);
  private fb = inject(FormBuilder);
  private materialService = inject(MaterialService);
  private cityService = inject(CityService);  
  // Computed signals
  readonly materialTypes = computed(() => this.materialTypesSignal());
  readonly cities = computed(() => this.cityService.cities());
  readonly departments = computed(() => this.cityService.departments());
  readonly currentFilters = computed(() => this.materialService.filters());
  readonly loading = computed(() => this.cityService.loading());

  // Signal para controlar si los filtros están expandidos
  readonly filtersExpanded = signal(false);

  constructor(
  ) {
    this.filterForm = this.createFilterForm();
    
    // Effect para reaccionar a cambios en los filtros actuales
    effect(() => {
      const filters = this.currentFilters();
      this.updateFormValues(filters);
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Crea el formulario de filtros
   */
  private createFilterForm(): FormGroup {
    return this.fb.group({
      type: [null],
      purchaseDate: [null],
      cityCode: [null],
      departmentCode: [null]
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
   * Actualiza los valores del formulario con los filtros actuales
   */
  private updateFormValues(filters: MaterialFilters): void {
    this.filterForm.patchValue({
      type: filters.type || null,
      purchaseDate: filters.purchaseDate || null,
      cityCode: filters.cityCode || null
    }, { emitEvent: false });
  }

  /**
   * Aplica los filtros seleccionados
   */
  applyFilters(): void {
    const formValue = this.filterForm.value;
    
    const filters: MaterialFilters = {
      type: formValue.type || undefined,
      purchaseDate: formValue.purchaseDate || undefined,
      cityCode: formValue.cityCode || undefined
    };

    // Eliminar propiedades undefined
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof MaterialFilters] === undefined) {
        delete filters[key as keyof MaterialFilters];
      }
    });

    this.materialService.searchMaterials(filters).subscribe({
      next: (materials) => {
        console.log(`Filtros aplicados: ${materials.length} materiales encontrados`);
      },
      error: (error) => {
        console.error('Error al aplicar filtros:', error);
      }
    });
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.materialService.clearFilters();
    this.materialService.getAllMaterials().subscribe();
  }

  /**
   * Maneja el cambio de departamento para filtrar ciudades
   */
  onDepartmentChange(departmentCode: string): void {
    // Limpiar la ciudad seleccionada cuando cambia el departamento
    this.filterForm.patchValue({ cityCode: null });
  }

  /**
   * Obtiene las ciudades filtradas por departamento
   */
  getFilteredCities() {
    const departmentCode = this.filterForm.get('departmentCode')?.value;
    if (!departmentCode) {
      return this.cities();
    }
    
    return this.cities().filter(city => 
      city.department.code === departmentCode
    );
  }

  /**
   * Verifica si hay filtros aplicados
   */
  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return Object.values(formValue).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }

  /**
   * Toggle para expandir/contraer filtros
   */
  toggleFilters(): void {
    this.filtersExpanded.update(expanded => !expanded);
  }

  /**
   * Maneja el evento de enter en campos de selección
   */
  onEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
  if (keyboardEvent.key === 'Enter') {
    this.applyFilters();
  }
}
}
