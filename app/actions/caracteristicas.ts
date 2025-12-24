'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { caracteristicasQueries } from '@/lib/db/queries/caracteristicas.queries';
import { AppError } from '@/lib/utils/errors';

export interface GetCaracteristicasResult {
  success: boolean;
  data?: Array<{ 
    id_tipo_caracteristica: number; 
    num_caracteristica: number; 
    descripcion: string;
    habilitado: boolean;
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function getCaracteristicasByTipoAction(idTipo: number): Promise<GetCaracteristicasResult> {
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

    const caracteristicas = await caracteristicasQueries.getByTipo(idTipo);

    return {
      success: true,
      data: caracteristicas,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CARACTERISTICAS_ERROR',
        },
      };
    }

    console.error('Error en getCaracteristicasByTipoAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener las características',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

