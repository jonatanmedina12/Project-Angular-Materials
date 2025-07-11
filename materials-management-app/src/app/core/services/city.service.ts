import { computed, Injectable, signal } from '@angular/core';
import { City } from '../models/city.model';
import { Department } from '../models/department.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CityService {

 private readonly baseUrl = 'http://localhost:8080/api/cities';
  
  private citiesSignal = signal<City[]>([]);
  private departmentsSignal = signal<Department[]>([]);
  private loadingSignal = signal(false);
  
  readonly cities = computed(() => this.citiesSignal());
  readonly departments = computed(() => this.departmentsSignal());
  readonly loading = computed(() => this.loadingSignal());

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las ciudades
   */
  getAllCities(): Observable<City[]> {
    this.loadingSignal.set(true);
    
    return this.http.get<ApiResponse<City[]>>(`${this.baseUrl}`)
      .pipe(
        map(response => {
          this.citiesSignal.set(response.data);
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          console.error('Error al obtener ciudades', error);
          this.loadingSignal.set(false);
          return of([]);
        })
      );
  }

  /**
   * Obtiene todos los departamentos
   */
  getAllDepartments(): Observable<Department[]> {
    this.loadingSignal.set(true);
    
    return this.http.get<ApiResponse<Department[]>>(`${this.baseUrl}/departments`)
      .pipe(
        map(response => {
          this.departmentsSignal.set(response.data);
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError(error => {
          console.error('Error al obtener departamentos', error);
          this.loadingSignal.set(false);
          return of([]);
        })
      );
  }
}
