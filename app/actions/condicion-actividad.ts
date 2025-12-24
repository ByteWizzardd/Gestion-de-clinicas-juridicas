'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { condicionActividadQueries } from '@/lib/db/queries/condicion-actividad.queries';
import { AppError } from '@/lib/utils/errors';

export interface GetCondicionActividadResult {
  success: boolean;
  data?: Array<{ id_actividad: number; nombre_actividad: string }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function getCondicionActividadAction(): Promise<GetCondicionActividadResult> {
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

    const condiciones = await condicionActividadQueries.getAll();

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
          code: error.code || 'CONDICION_ACTIVIDAD_ERROR',
        },
      };
    }

    console.error('Error en getCondicionActividadAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener las condiciones de actividad',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

