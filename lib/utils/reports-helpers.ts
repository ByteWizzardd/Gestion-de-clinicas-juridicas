/**
 * Helpers para funciones de reportes
 * Centraliza lógica común de manejo de fechas y términos
 */
import { logger } from '@/lib/utils/logger';

/**
 * Obtiene las fechas de inicio y fin basadas en un término (semestre)
 * @param fechaInicio Fecha de inicio opcional
 * @param fechaFin Fecha de fin opcional
 * @param term Término (semestre) opcional
 * @returns Objeto con fechaInicio y fechaFin (pueden ser undefined)
 */
export async function resolveDateRange(
  fechaInicio?: string,
  fechaFin?: string,
  term?: string
): Promise<{ start?: string; end?: string }> {
  // Las fechas del usuario se pasan tal cual.
  // El filtro por semestre se maneja en el SQL via el parámetro term ($3/$4).
  // Ambos pueden combinarse: term filtra por ocurren_en, fechas por fecha_inicio_caso.
  return {
    start: fechaInicio || undefined,
    end: fechaFin || undefined,
  };
}

/**
 * Maneja errores de forma consistente en funciones de reportes
 * @param error Error capturado
 * @param context Contexto del error (nombre de la función)
 * @returns Objeto de error estandarizado
 */
export function handleReportError(
  error: unknown,
  context: string
): { success: false; error: string } {
  logger.error(`Error en ${context}:`, error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Error desconocido',
  };
}
