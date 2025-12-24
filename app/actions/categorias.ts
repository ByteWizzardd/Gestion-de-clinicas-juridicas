'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { categoriasQueries } from '@/lib/db/queries/categorias.queries';
import { AppError } from '@/lib/utils/errors';

export interface GetCategoriasResult {
  success: boolean;
  data?: Array<{ num_categoria: number; nombre_categoria: string }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function getCategoriasByMateriaAction(idMateria: number): Promise<GetCategoriasResult> {
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

    const categorias = await categoriasQueries.getByMateria(idMateria);

    return {
      success: true,
      data: categorias,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CATEGORIA_ERROR',
        },
      };
    }

    console.error('Error en getCategoriasByMateriaAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener las categorías',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

