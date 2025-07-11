import { computed, Injectable, signal } from '@angular/core';
import { City } from '../models/city.model';
import { Department } from '../models/department.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  private readonly baseUrl = `${environment.apiUrl}/cities`;
  private readonly departmentsUrl = `${environment.apiUrl}/departments`;
  
  private citiesSignal = signal<City[]>([]);
  private departmentsSignal = signal<Department[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  
  readonly cities = computed(() => this.citiesSignal());
  readonly departments = computed(() => this.departmentsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las ciudades
   */
  getAllCities(): Observable<City[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<ApiResponse<City[]>>(`${this.baseUrl}`)
      .pipe(
        map(response => {
          this.citiesSignal.set(response.data);
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al obtener ciudades', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene una ciudad por código
   */
  getCityByCode(code: string): Observable<City | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<ApiResponse<City>>(`${this.baseUrl}/${code}`)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al obtener ciudad', error);
          return of(null);
        })
      );
  }

  /**
   * Busca ciudades por departamento
   */
  getCitiesByDepartment(departmentCode: string): Observable<City[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<ApiResponse<City[]>>(`${this.baseUrl}/by-department/${departmentCode}`)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al obtener ciudades por departamento', error);
          return of([]);
        })
      );
  }

  /**
   * Busca ciudades por nombre
   */
  getCitiesByName(name: string): Observable<City[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    const params = new HttpParams().set('name', name);
    
    return this.http.get<ApiResponse<City[]>>(`${this.baseUrl}/by-name`, { params })
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al buscar ciudades por nombre', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene todos los departamentos
   */
  getAllDepartments(): Observable<Department[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<ApiResponse<Department[]>>(`${this.departmentsUrl}`)
      .pipe(
        map(response => {
          this.departmentsSignal.set(response.data);
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al obtener departamentos', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene un departamento por código
   */
  getDepartmentByCode(code: string): Observable<Department | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<ApiResponse<Department>>(`${this.departmentsUrl}/${code}`)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al obtener departamento', error);
          return of(null);
        })
      );
  }

  /**
   * Busca departamentos por nombre
   */
  getDepartmentsByName(name: string): Observable<Department[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    const params = new HttpParams().set('name', name);
    
    return this.http.get<ApiResponse<Department[]>>(`${this.departmentsUrl}/by-name`, { params })
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          this.handleError('Error al buscar departamentos por nombre', error);
          return of([]);
        })
      );
  }

  /**
   * Limpia el error actual
   */
  clearError(): void {
    this.errorSignal.set(null);
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
