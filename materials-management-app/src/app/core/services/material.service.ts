import { computed, Injectable, signal } from '@angular/core';
import { Material } from '../models/material.model';
import { MaterialFilters } from '../models/material-filters.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
 private readonly baseUrl = 'http://localhost:8080/api/materials';
  
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
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al obtener materiales', error);
          return of([]);
        })
      );
  }

  /**
   * Busca materiales con filtros
   */
  searchMaterials(filters: MaterialFilters): Observable<Material[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.filtersSignal.set(filters);
    
    let params = new HttpParams();
    if (filters.type) params = params.set('type', filters.type);
    if (filters.cityCode) params = params.set('cityCode', filters.cityCode);
    if (filters.purchaseDate) {
      params = params.set('purchaseDate', filters.purchaseDate.toISOString());
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
   * Crea un nuevo material
   */
  createMaterial(material: Material): Observable<Material> {
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
  updateMaterial(id: number, material: Material): Observable<Material> {
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
    this.errorSignal.set(message);
    this.loadingSignal.set(false);
  }
}
