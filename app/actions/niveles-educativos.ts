'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { nivelesEducativosQueries } from '@/lib/db/queries/niveles-educativos.queries';
import { AppError } from '@/lib/utils/errors';

export interface GetNivelesEducativosResult {
  success: boolean;
  data?: Array<{
    id_nivel_educativo: number;
    descripcion: string;
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener todos los niveles educativos
 */
export async function getNivelesEducativosAction(): Promise<GetNivelesEducativosResult> {
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

    const nivelesEducativos = await nivelesEducativosQueries.getAll();

    return {
      success: true,
      data: nivelesEducativos,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'NIVELES_EDUCATIVOS_ERROR',
        },
      };
    }

    console.error('Error en getNivelesEducativosAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener niveles educativos',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

