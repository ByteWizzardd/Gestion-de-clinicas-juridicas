/**
 * Helpers para funciones de reportes
 * Centraliza lógica común de manejo de fechas y términos
 */

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
  let start = fechaInicio;
  let end = fechaFin;

  // Si hay term, obtener sus fechas
  if (term && term !== 'all') {
    const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
    const semestre = await semestresQueries.getByTerm(term);
    if (semestre) {
      start = semestre.fecha_inicio.toISOString().split('T')[0];
      end = semestre.fecha_fin.toISOString().split('T')[0];
    }
  }

  return {
    start: start || undefined,
    end: end || undefined,
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
  console.error(`Error en ${context}:`, error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Error desconocido',
  };
}
