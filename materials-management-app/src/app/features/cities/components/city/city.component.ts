import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { City } from '../../../../core/models/city.model';
import { CityService } from '../../../../core/services/city.service';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

/**
 * Interfaz para configuración de columnas de la tabla
 */
interface TableColumnConfig {
  readonly key: string;
  readonly title: string;
  readonly sortable: boolean;
  readonly width: string;
}

/**
 * Interfaz para estadísticas del componente
 */
interface ComponentStats {
  readonly totalCities: number;
  readonly totalDepartments: number;
  readonly filteredCount: number;
  readonly isFiltered: boolean;
}

/**
 * Componente principal para gestión de ciudades y departamentos
 * Implementa principios SOLID y mejores prácticas de Angular 18+
 */
@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzCardModule,
    NzSpinModule,
    NzTagModule,
    NzCollapseModule,
    NzEmptyModule,
    NzToolTipModule,
  ],
})
export class CityComponent implements OnInit {
  readonly searchForm: FormGroup;
  
  // Signals para el estado del componente (principio de responsabilidad única)
  private readonly filteredCitiesSignal = signal<City[]>([]);
  private readonly selectedDepartmentSignal = signal<string | null>(null);
  private readonly filtersVisibleSignal = signal(false);

  // Servicios inyectados usando dependency injection
  private readonly cityService = inject(CityService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(NzMessageService);

  // Computed signals para derivar estado de manera reactiva
  readonly cities = computed(() => this.cityService.cities());
  readonly departments = computed(() => this.cityService.departments());
  readonly loading = computed(() => this.cityService.loading());
  readonly error = computed(() => this.cityService.error());
  readonly filteredCities = computed(() => {
    const filtered = this.filteredCitiesSignal();
    return filtered.length > 0 ? filtered : this.cities();
  });
  readonly filtersVisible = computed(() => this.filtersVisibleSignal());
  readonly selectedDepartment = computed(() => this.selectedDepartmentSignal());

  // Configuración inmutable de la tabla
  readonly tableColumns: TableColumnConfig[] = [
    { key: 'code', title: 'Código', sortable: true, width: '120px' },
    { key: 'name', title: 'Nombre', sortable: true, width: '200px' },
    { key: 'department', title: 'Departamento', sortable: true, width: '200px' },
    { key: 'departmentCode', title: 'Cód. Departamento', sortable: true, width: '150px' }
  ];

  // Configuración de colores para departamentos
  private readonly departmentColors: ReadonlyMap<string, string> = new Map([
    ['DC', 'blue'],
    ['ANT', 'green'],
    ['VAL', 'orange'],
    ['ATL', 'purple'],
    ['BOL', 'cyan']
  ]);

  constructor() {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Crea el formulario de búsqueda con validación
   */
  private createSearchForm(): FormGroup {
    return this.fb.group({
      cityName: [''],
      departmentCode: [''],
      departmentName: ['']
    });
  }

  /**
   * Carga los datos iniciales del componente
   */
  private loadInitialData(): void {
    this.loadCities();
    this.loadDepartments();
  }

  /**
   * Carga las ciudades desde el servicio
   */
  private loadCities(): void {
    this.cityService.getAllCities().subscribe({
      next: (cities) => {
        this.messageService.success(`${cities.length} ciudades cargadas correctamente`);
      },
      error: (error) => {
        this.handleError('Error al cargar ciudades', error);
      }
    });
  }

  /**
   * Carga los departamentos desde el servicio
   */
  private loadDepartments(): void {
    this.cityService.getAllDepartments().subscribe({
      next: (departments) => {
        console.log(`${departments.length} departamentos cargados`);
      },
      error: (error) => {
        this.handleError('Error al cargar departamentos', error);
      }
    });
  }

  /**
   * Maneja errores de manera centralizada
   */
  private handleError(message: string, error: any): void {
    this.messageService.error(message);
    console.error('Error:', error);
  }

  /**
   * Busca ciudades por nombre
   */
  searchCitiesByName(): void {
    const cityName = this.searchForm.get('cityName')?.value?.trim();
    
    if (!this.validateSearchInput(cityName, 'Ingrese un nombre de ciudad para buscar')) {
      return;
    }

    this.cityService.getCitiesByName(cityName).subscribe({
      next: (cities) => {
        this.filteredCitiesSignal.set(cities);
        this.messageService.success(`Se encontraron ${cities.length} ciudades`);
      },
      error: (error) => {
        this.handleError('Error al buscar ciudades por nombre', error);
      }
    });
  }

  /**
   * Busca ciudades por departamento
   */
  searchCitiesByDepartment(): void {
    const departmentCode = this.searchForm.get('departmentCode')?.value;
    
    if (!this.validateSearchInput(departmentCode, 'Seleccione un departamento')) {
      return;
    }

    this.selectedDepartmentSignal.set(departmentCode);
    
    this.cityService.getCitiesByDepartment(departmentCode).subscribe({
      next: (cities) => {
        this.filteredCitiesSignal.set(cities);
        const department = this.findDepartmentByCode(departmentCode);
        this.messageService.success(`Se encontraron ${cities.length} ciudades en ${department?.name || 'el departamento'}`);
      },
      error: (error) => {
        this.handleError('Error al buscar ciudades por departamento', error);
      }
    });
  }

  /**
   * Busca departamentos por nombre
   */
  searchDepartmentsByName(): void {
    const departmentName = this.searchForm.get('departmentName')?.value?.trim();
    
    if (!this.validateSearchInput(departmentName, 'Ingrese un nombre de departamento para buscar')) {
      return;
    }

    this.cityService.getDepartmentsByName(departmentName).subscribe({
      next: (departments) => {
        this.messageService.success(`Se encontraron ${departments.length} departamentos`);
        console.log('Departamentos encontrados:', departments);
      },
      error: (error) => {
        this.handleError('Error al buscar departamentos por nombre', error);
      }
    });
  }

  /**
   * Valida entrada de búsqueda
   */
  private validateSearchInput(value: string, warningMessage: string): boolean {
    if (!value) {
      this.messageService.warning(warningMessage);
      return false;
    }
    return true;
  }

  /**
   * Encuentra departamento por código
   */
  private findDepartmentByCode(code: string) {
    return this.departments().find(d => d.code === code);
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.searchForm.reset();
    this.filteredCitiesSignal.set([]);
    this.selectedDepartmentSignal.set(null);
    this.messageService.info('Filtros limpiados');
  }

  /**
   * Actualiza la lista de ciudades
   */
  refreshCities(): void {
    this.clearFilters();
    this.loadInitialData();
  }

  /**
   * Toggle para mostrar/ocultar filtros
   */
  toggleFilters(): void {
    this.filtersVisibleSignal.update(visible => !visible);
  }

  /**
   * Verifica si hay filtros aplicados
   */
  hasActiveFilters(): boolean {
    const formValue = this.searchForm.value;
    return Object.values(formValue).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }

  /**
   * Maneja errores y muestra mensaje de retry
   */
  onErrorRetry(): void {
    this.cityService.clearError();
    this.loadInitialData();
  }

  /**
   * Obtiene el color del tag para el departamento
   */
  getDepartmentTagColor(departmentCode: string): string {
    return this.departmentColors.get(departmentCode) || 'default';
  }

  /**
   * TrackBy function para optimizar el rendering de la tabla
   */
  trackByCityCode(index: number, city: City): string {
    return city.code;
  }

  /**
   * Funciones de ordenamiento para la tabla
   */
  readonly sortFunctions = {
    code: (a: City, b: City) => a.code.localeCompare(b.code),
    name: (a: City, b: City) => a.name.localeCompare(b.name),
    departmentName: (a: City, b: City) => a.department.name.localeCompare(b.department.name),
    departmentCode: (a: City, b: City) => a.department.code.localeCompare(b.department.code)
  };

  /**
   * Obtiene el número de ciudades por departamento
   */
  getCitiesCountByDepartment(departmentCode: string): number {
    return this.cities().filter(city => city.department.code === departmentCode).length;
  }

  /**
   * Maneja el evento de enter en los campos de búsqueda
   */
  onEnterKey(event: KeyboardEvent, searchType: 'city' | 'department'): void {
    if (event.key === 'Enter') {
      switch (searchType) {
        case 'city':
          this.searchCitiesByName();
          break;
        case 'department':
          this.searchDepartmentsByName();
          break;
      }
    }
  }

  /**
   * Muestra detalles de una ciudad
   */
  showCityDetails(city: City): void {
    const citiesInDepartment = this.getCitiesCountByDepartment(city.department.code);
    
    this.messageService.info(
      `Ciudad: ${city.name} (${city.code}) - Departamento: ${city.department.name} (${city.department.code}) - ${citiesInDepartment} ciudades en el departamento`
    );
  }

  /**
   * Obtiene información de estadísticas
   */
  getStats(): ComponentStats {
    const totalCities = this.cities().length;
    const totalDepartments = this.departments().length;
    const filteredCount = this.filteredCities().length;
    
    return {
      totalCities,
      totalDepartments,
      filteredCount,
      isFiltered: this.filteredCitiesSignal().length > 0
    };
  }
}