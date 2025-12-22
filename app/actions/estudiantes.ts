'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { estudiantesQueries } from '@/lib/db/queries/estudiantes/estudiantes.queries';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';

export interface SearchEstudiantesResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para buscar estudiantes por cédula
 */
export async function searchEstudiantesAction(query: string): Promise<SearchEstudiantesResult> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const estudiantes = await estudiantesQueries.searchByCedula(query.trim());

    return {
      success: true,
      data: estudiantes,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'ESTUDIANTE_ERROR',
        },
      };
    }

    console.error('Error en searchEstudiantesAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al buscar estudiantes',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

