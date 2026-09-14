import { logger } from './logger';
import { AppError } from './errors';
import { toUserMessage } from './error-messages';

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
    if (error.statusCode >= 500) logger.error(`Error en ${context}:`, error);
    return {
      success: false,
      error: {
        // Los servicios a veces envuelven el error de la BD dentro del mensaje del AppError.
        message: toUserMessage(error),
        code: error.code || defaultCode,
        fields: (error as any).fields,
      },
    };
  }

  logger.error(`Error en ${context}:`, error);
  return {
    success: false,
    error: {
      message: toUserMessage(error),
      code: defaultCode,
    },
  };
}
