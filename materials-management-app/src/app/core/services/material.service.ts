import { computed, Injectable, signal } from '@angular/core';
import { Material } from '../models/material.model';
import { MaterialFilters } from '../models/material-filters.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';
import { MaterialRequestDto } from '../models/material-request.dto';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
 private readonly baseUrl = `${environment.apiUrl}/materials`;
  
  // Signals para manejo de estado
  private materialsSignal = signal<Material[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private filtersSignal = signal<MaterialFilters>({});
  
  // Computed signals para datos derivados
  readonly materials = computed(() => this.materialsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly filters = computed(() => this.filtersSignal());
  
  // Computed para filtros aplicados
  readonly filteredMaterials = computed(() => {
    const materials = this.materialsSignal();
    const filters = this.filtersSignal();
    
    if (Object.keys(filters).length === 0) {
      return materials;
    }
    
    return materials.filter(material => {
      if (filters.type && material.type !== filters.type) return false;
      if (filters.cityCode && material.city.code !== filters.cityCode) return false;
      if (filters.purchaseDate) {
        const filterDate = new Date(filters.purchaseDate);
        const materialDate = new Date(material.purchaseDate);
        if (materialDate.toDateString() !== filterDate.toDateString()) return false;
      }
      return true;
    });
  });

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los materiales
   */
  getAllMaterials(): Observable<Material[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<ApiResponse<Material[]>>(`${this.baseUrl}`)
      .pipe(
        map(response => {
          this.materialsSignal.set(response.data);
          this.loadingSignal.set(false);
          this.filtersSignal.set({}); // Limpiar filtros al cargar todos
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al obtener materiales', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene un material por ID
   */
  getMaterialById(id: number): Observable<Material | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<ApiResponse<Material>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al obtener material', error);
          return of(null);
        })
      );
  }

  /**
   * Busca materiales con filtros avanzados
   */
  searchMaterials(filters: MaterialFilters): Observable<Material[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.filtersSignal.set(filters);
    
    let params = new HttpParams();
    if (filters.type) params = params.set('type', filters.type);
    if (filters.cityCode) params = params.set('cityCode', filters.cityCode);
    if (filters.departmentCode) params = params.set('departmentCode', filters.departmentCode);
    if (filters.purchaseDate) {
      // Formatear fecha como string YYYY-MM-DD
      const dateStr = filters.purchaseDate instanceof Date 
        ? filters.purchaseDate.toISOString().split('T')[0]
        : filters.purchaseDate;
      params = params.set('purchaseDate', dateStr);
    }
    
    return this.http.get<ApiResponse<Material[]>>(`${this.baseUrl}/search`, { params })
      .pipe(
        map(response => {
          this.materialsSignal.set(response.data);
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al buscar materiales', error);
          return of([]);
        })
      );
  }

  /**
   * Busca materiales por tipo
   */
  getMaterialsByType(type: string): Observable<Material[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<ApiResponse<Material[]>>(`${this.baseUrl}/by-type/${type}`)
      .pipe(
        map(response => {
          this.materialsSignal.set(response.data);
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al buscar materiales por tipo', error);
          return of([]);
        })
      );
  }

  /**
   * Busca materiales por ciudad
   */
  getMaterialsByCity(cityCode: string): Observable<Material[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<ApiResponse<Material[]>>(`${this.baseUrl}/by-city/${cityCode}`)
      .pipe(
        map(response => {
          this.materialsSignal.set(response.data);
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al buscar materiales por ciudad', error);
          return of([]);
        })
      );
  }

  /**
   * Busca materiales por departamento
   */
  getMaterialsByDepartment(departmentCode: string): Observable<Material[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<ApiResponse<Material[]>>(`${this.baseUrl}/by-department/${departmentCode}`)
      .pipe(
        map(response => {
          this.materialsSignal.set(response.data);
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al buscar materiales por departamento', error);
          return of([]);
        })
      );
  }

  /**
   * Busca materiales por nombre
   */
  getMaterialsByName(name: string): Observable<Material[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    const params = new HttpParams().set('name', name);
    
    return this.http.get<ApiResponse<Material[]>>(`${this.baseUrl}/by-name`, { params })
      .pipe(
        map(response => {
          this.materialsSignal.set(response.data);
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al buscar materiales por nombre', error);
          return of([]);
        })
      );
  }

  /**
 * Crea un nuevo material
 */
createMaterial(material: MaterialRequestDto): Observable<Material> {
  this.loadingSignal.set(true);
  this.errorSignal.set(null);
  
  return this.http.post<ApiResponse<Material>>(`${this.baseUrl}`, material)
    .pipe(
      map(response => {
        const currentMaterials = this.materialsSignal();
        this.materialsSignal.set([...currentMaterials, response.data]);
        this.loadingSignal.set(false);
        return response.data;
      }),
      catchError(error => {
        this.handleError('Error al crear material', error);
        throw error;
      })
    );
}

 /**
 * Actualiza un material existente
 */
updateMaterial(id: number, material: MaterialRequestDto): Observable<Material> {
  this.loadingSignal.set(true);
  this.errorSignal.set(null);
  
  return this.http.put<ApiResponse<Material>>(`${this.baseUrl}/${id}`, material)
    .pipe(
      map(response => {
        const currentMaterials = this.materialsSignal();
        const updatedMaterials = currentMaterials.map(m => 
          m.id === id ? response.data : m
        );
        this.materialsSignal.set(updatedMaterials);
        this.loadingSignal.set(false);
        return response.data;
      }),
      catchError(error => {
        this.handleError('Error al actualizar material', error);
        throw error;
      })
    );
}
  /**
   * Elimina un material
   */
  deleteMaterial(id: number): Observable<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => {
          const currentMaterials = this.materialsSignal();
          const updatedMaterials = currentMaterials.filter(m => m.id !== id);
          this.materialsSignal.set(updatedMaterials);
          this.loadingSignal.set(false);
          return true;
        }),
        catchError(error => {
          this.handleError('Error al eliminar material', error);
          throw error;
        })
      );
  }

  /**
   * Formatea el material para envío al backend
   */
  private formatMaterialForBackend(material: Partial<Material>): any {
    return {
      name: material.name,
      description: material.description,
      type: material.type,
      price: material.price,
      purchaseDate: material.purchaseDate instanceof Date 
        ? material.purchaseDate.toISOString().split('T')[0]
        : material.purchaseDate,
      saleDate: material.saleDate 
        ? (material.saleDate instanceof Date 
          ? material.saleDate.toISOString().split('T')[0]
          : material.saleDate)
        : null,
      status: material.status,
      cityCode: material.city?.code
    };
  }

  /**
   * Limpia el error actual
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Limpia los filtros aplicados
   */
  clearFilters(): void {
    this.filtersSignal.set({});
  }

  /**
   * Maneja errores de la API
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    let errorMessage = message;
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión con el servidor';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor';
    }
    
    this.errorSignal.set(errorMessage);
    this.loadingSignal.set(false);
  }
}
