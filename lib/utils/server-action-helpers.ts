/**
 * Helpers para Server Actions
 * Funciones auxiliares para manejo de errores y respuestas consistentes
 */

import { AppError } from './errors';

export interface ServerActionError {
  message: string;
  code?: string;
  fields?: Record<string, string[]>;
}

/**
 * Maneja errores en Server Actions y retorna formato estándar
 * @param error Error capturado
 * @param context Contexto del error (nombre de la función)
 * @param defaultCode Código de error por defecto
 * @returns Objeto de error estandarizado
 */
export function handleServerActionError(
  error: unknown,
  context: string,
  defaultCode: string = 'UNKNOWN_ERROR'
): { success: false; error: ServerActionError } {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || defaultCode,
        fields: (error as any).fields,
      },
    };
  }

  console.error(`Error en ${context}:`, error);
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : 'Error desconocido',
      code: defaultCode,
    },
  };
}
