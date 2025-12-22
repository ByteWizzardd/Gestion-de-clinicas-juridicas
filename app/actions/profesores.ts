'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { profesoresQueries } from '@/lib/db/queries/profesores/profesores.queries';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';

export interface SearchProfesoresResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para buscar profesores por cédula
 */
export async function searchProfesoresAction(query: string): Promise<SearchProfesoresResult> {
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

    const profesores = await profesoresQueries.searchByCedula(query.trim());

    return {
      success: true,
      data: profesores,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'PROFESOR_ERROR',
        },
      };
    }

    console.error('Error en searchProfesoresAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al buscar profesores',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

