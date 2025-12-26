'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { condicionTrabajoQueries } from '@/lib/db/queries/condicion-trabajo.queries';
import { AppError } from '@/lib/utils/errors';

export interface GetCondicionTrabajoResult {
  success: boolean;
  data?: Array<{ id_trabajo: number; nombre_trabajo: string }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function getCondicionTrabajoAction(): Promise<GetCondicionTrabajoResult> {
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

    const condiciones = await condicionTrabajoQueries.getAll();

    return {
      success: true,
      data: condiciones,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CONDICION_TRABAJO_ERROR',
        },
      };
    }

    console.error('Error en getCondicionTrabajoAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener las condiciones de trabajo',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

