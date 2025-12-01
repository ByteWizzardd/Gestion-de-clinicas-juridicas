import { NextResponse } from 'next/server';
import { AppError, ValidationError } from './errors';
import { logger } from './logger';

/**
 * Crea una respuesta exitosa
 * 
 * @param data Datos a retornar
 * @param statusCode Código de estado HTTP (default: 200)
 * @returns NextResponse con formato estándar de éxito
 */
export function successResponse<T>(data: T, statusCode: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  );
}

/**
 * Crea una respuesta de error
 * Maneja diferentes tipos de errores y retorna formato estándar
 * 
 * @param error Error a manejar
 * @returns NextResponse con formato estándar de error
 */
export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    const response: any = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    };

    // Agregar campos de validación si es ValidationError
    if (error instanceof ValidationError && error.fields) {
      response.error.fields = error.fields;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Error no esperado - no exponer detalles en producción
  logger.error('Error no manejado', error);
  
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
    },
    { status: 500 }
  );
}

/**
 * Crea una respuesta de error personalizada
 * 
 * @param message Mensaje de error
 * @param statusCode Código de estado HTTP
 * @param code Código de error personalizado
 * @returns NextResponse con formato estándar de error
 */
export function customErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: code || 'CUSTOM_ERROR',
      },
    },
    { status: statusCode }
  );
}

