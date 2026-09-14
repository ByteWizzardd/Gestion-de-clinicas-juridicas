/**
 * Helpers para funciones de reportes
 * Centraliza lógica común de manejo de fechas y términos
 */
import { logger } from '@/lib/utils/logger';
import { toUserMessage } from '@/lib/utils/error-messages';

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
  // Las fechas del usuario se pasan tal cual. En el SQL:
  //   - fechas: el caso tiene actividad fechada dentro del rango (función
  //     caso_con_actividad_en_rango: inicio, citas, acciones, ejecuciones,
  //     cambios de estatus, soportes);
  //   - term: el caso ocurre en ese semestre (ocurren_en).
  // Ambos pueden combinarse.
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
    error: toUserMessage(error, 'No se pudieron obtener los datos del reporte.'),
  };
}
