'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { nucleosQueries } from '@/lib/db/queries/nucleos.queries';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';

export interface GetNucleosResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener todos los núcleos
 */
export async function getNucleosAction(): Promise<GetNucleosResult> {
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

    const nucleos = await nucleosQueries.getAll();

    return {
      success: true,
      data: nucleos,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'NUCLEO_ERROR',
        },
      };
    }

    console.error('Error en getNucleosAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener núcleos',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

