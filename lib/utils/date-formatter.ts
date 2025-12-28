/**
 * Utilidades para formatear fechas
 */

/**
 * Formatea una fecha a formato DD/MM/YYYY
 * @param date - Fecha en formato string (YYYY-MM-DD) o Date
 * @returns Fecha formateada como DD/MM/YYYY o 'N/A' si es null/undefined
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    let day: number, month: number, year: number;
    
    if (typeof date === 'string') {
      // Si es un string, parsear manualmente para evitar problemas de zona horaria
      if (date.includes('-')) {
        const parts = date.split('-');
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10); // Mes 1-12
        day = parseInt(parts[2].split(' ')[0], 10); // Tomar solo la parte de la fecha si hay hora
      } else {
        // Si no tiene formato esperado, intentar con Date
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          return 'N/A';
        }
        day = dateObj.getDate();
        month = dateObj.getMonth() + 1;
        year = dateObj.getFullYear();
      }
    } else {
      // Si es un objeto Date, usar los métodos locales
      day = date.getDate();
      month = date.getMonth() + 1;
      year = date.getFullYear();
    }
    
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param fechaNacimiento - Fecha de nacimiento en formato string (YYYY-MM-DD) o Date
 * @returns Edad en años o null si no se puede calcular
 */
export function calculateAge(fechaNacimiento: string | Date | null | undefined): number | null {
  if (!fechaNacimiento) return null;
  
  try {
    const birthDate = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;
    
    if (isNaN(birthDate.getTime())) {
      return null;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
}

