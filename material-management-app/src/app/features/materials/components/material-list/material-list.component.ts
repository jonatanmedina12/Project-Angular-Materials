import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Material } from '../../../../core/models/material.model';
import { MaterialStatus } from '../../../../core/models/material-status.enum';
import { MaterialService } from '../../../../core/services/material.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { ErrorMessageComponent } from "../../../../shared/components/error-message/error-message.component";

@Component({
  selector: 'app-material-list',
  templateUrl: './material-list.component.html',
  styleUrls: ['./material-list.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzSpinModule,
    NzTagModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzAlertModule,
    ErrorMessageComponent
],
  standalone: true
})
export class MaterialListComponent implements OnInit {

   // Signals locales para el componente
  private selectedMaterialsSignal = signal<Material[]>([]);
  
  // Computed signals
  readonly materials = computed(() => this.materialService.filteredMaterials());
  readonly loading = computed(() => this.materialService.loading());
  readonly error = computed(() => this.materialService.error());
  readonly selectedMaterials = computed(() => this.selectedMaterialsSignal());
  readonly hasSelectedMaterials = computed(() => this.selectedMaterials().length > 0);
  private materialService = inject(MaterialService);
  private messageService = inject(NzMessageService);
  // Configuración de la tabla
  readonly tableColumns = [
    { key: 'name', title: 'Nombre', sortable: true },
    { key: 'type', title: 'Tipo', sortable: true },
    { key: 'price', title: 'Precio', sortable: true },
    { key: 'purchaseDate', title: 'Fecha Compra', sortable: true },
    { key: 'status', title: 'Estado', sortable: true },
    { key: 'city', title: 'Ciudad', sortable: false },
    { key: 'actions', title: 'Acciones', sortable: false }
  ];

  constructor(
  ) {}

  ngOnInit(): void {
    this.loadMaterials();
  }
/**
 * Maneja el cierre del mensaje de error
 */
onErrorClose(): void {
  this.materialService.clearError();
}

/**
 * Maneja el retry desde el mensaje de error
 */
onErrorRetry(): void {
  this.materialService.clearError();
  this.loadMaterials();
}

/**
 * Carga materiales mejorada
 */
loadMaterials(): void {
  this.materialService.getAllMaterials().subscribe({
    next: (materials) => {
      // Solo mostrar éxito si NO hay error en el servicio
      if (!this.error() && materials.length > 0) {
        this.messageService.success(`${materials.length} materiales cargados correctamente`);
      } else if (!this.error() && materials.length === 0) {
        this.messageService.info('No se encontraron materiales');
      }
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });
}

  /**
   * Maneja la selección de materiales en la tabla
   */
  onSelectionChange(selectedMaterials: Material[]): void {
    this.selectedMaterialsSignal.set(selectedMaterials);
  }

  /**
   * Obtiene el color del tag según el estado
   */
  getStatusTagColor(status: MaterialStatus): string {
    switch (status) {
      case MaterialStatus.ACTIVE:
        return 'green';
      case MaterialStatus.AVAILABLE:
        return 'blue';
      case MaterialStatus.ASSIGNED:
        return 'orange';
      default:
        return 'default';
    }
  }

  /**
   * Obtiene el texto del estado
   */
  getStatusText(status: MaterialStatus): string {
    switch (status) {
      case MaterialStatus.ACTIVE:
        return 'Activo';
      case MaterialStatus.AVAILABLE:
        return 'Disponible';
      case MaterialStatus.ASSIGNED:
        return 'Asignado';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Formatea el precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  }

  /**
   * Formatea la fecha
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-CO');
  }

  /**
   * Recarga la lista de materiales
   */
  refreshMaterials(): void {
    this.loadMaterials();
  }

  /**
   * Elimina los materiales seleccionados
   */
  deleteSelectedMaterials(): void {
    if (this.selectedMaterials().length === 0) {
      this.messageService.warning('No hay materiales seleccionados');
      return;
    }
    
    this.messageService.success(
      `Se eliminarán ${this.selectedMaterials().length} materiales`
    );
    
    // Aquí implementarías la lógica de eliminación
    this.selectedMaterialsSignal.set([]);
  }

  /**
   * Maneja la selección individual de materiales
   */
  onMaterialSelectionChange(material: Material, checked: boolean): void {
    const currentSelected = this.selectedMaterials();
    if (checked) {
      this.selectedMaterialsSignal.set([...currentSelected, material]);
    } else {
      this.selectedMaterialsSignal.set(
        currentSelected.filter(m => m.id !== material.id)
      );
    }
  }

  /**
   * TrackBy function para optimizar el rendering
   */
  trackByMaterialId(index: number, material: Material): number {
    return material.id || index;
  }

  /**
   * Obtiene el color del tag según el tipo
   */
  getTypeTagColor(type: string): string {
    // Colores según el tipo de material
    const colors: { [key: string]: string } = {
      'ELECTRONICO': 'purple',
      'MECANICO': 'orange',
      'QUIMICO': 'red',
      'TEXTIL': 'cyan',
      'CONSTRUCCION': 'geekblue'
    };
    return colors[type.toUpperCase()] || 'default';
  }

}
