'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { subcategoriasQueries } from '@/lib/db/queries/subcategorias.queries';
import { AppError } from '@/lib/utils/errors';

export interface GetSubcategoriasResult {
  success: boolean;
  data?: Array<{ num_subcategoria: number; nombre_subcategoria: string }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function getSubcategoriasByMateriaCategoriaAction(
  idMateria: number,
  numCategoria: number
): Promise<GetSubcategoriasResult> {
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

    const subcategorias = await subcategoriasQueries.getByMateriaCategoria(idMateria, numCategoria);

    return {
      success: true,
      data: subcategorias,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'SUBCATEGORIA_ERROR',
        },
      };
    }

    console.error('Error en getSubcategoriasByMateriaCategoriaAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener las subcategorías',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

