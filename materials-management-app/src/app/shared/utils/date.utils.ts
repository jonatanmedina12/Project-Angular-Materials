/**
 * Utilidades para manejo de fechas
 */
export class DateUtils {
  
  /**
   * Formatea una fecha en formato español
   */
  static formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'long') {
      return dateObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return dateObj.toLocaleDateString('es-CO');
  }

  /**
   * Valida que la fecha de compra no sea mayor a la fecha de venta
   */
  static validatePurchaseSaleDates(purchaseDate: Date, saleDate: Date | null): boolean {
    if (!saleDate) return true;
    return new Date(purchaseDate) <= new Date(saleDate);
  }

  /**
   * Obtiene la fecha actual en formato ISO
   */
  static getCurrentDateISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Convierte una fecha a formato ISO para el backend
   */
  static toISOString(date: Date): string {
    return date.toISOString();
  }
}