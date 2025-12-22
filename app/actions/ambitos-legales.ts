'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { ambitosLegalesQueries } from '@/lib/db/queries/ambitos-legales.queries';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';

export interface GetAmbitosLegalesResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener todos los ámbitos legales
 */
export async function getAmbitosLegalesAction(): Promise<GetAmbitosLegalesResult> {
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

    const ambitos = await ambitosLegalesQueries.getAll();

    return {
      success: true,
      data: ambitos,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'AMBITO_LEGAL_ERROR',
        },
      };
    }

    console.error('Error en getAmbitosLegalesAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener ámbitos legales',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

