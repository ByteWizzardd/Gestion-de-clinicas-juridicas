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
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
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

