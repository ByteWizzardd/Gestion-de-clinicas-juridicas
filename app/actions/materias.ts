'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { materiasQueries } from '@/lib/db/queries/materias.queries';
import { AppError } from '@/lib/utils/errors';

export interface GetMateriasResult {
  success: boolean;
  data?: Array<{ id_materia: number; nombre_materia: string }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function getMateriasAction(): Promise<GetMateriasResult> {
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

    const materias = await materiasQueries.getAll();

    return {
      success: true,
      data: materias,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'MATERIA_ERROR',
        },
      };
    }

    console.error('Error en getMateriasAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener las materias',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

