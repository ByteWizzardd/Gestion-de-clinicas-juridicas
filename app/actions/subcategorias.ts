'use server';

import { subcategoriasQueries } from '@/lib/db/queries/subcategorias.queries';
import { AppError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

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
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const subcategorias = await subcategoriasQueries.getByMateriaCategoria(idMateria, numCategoria);

    return {
      success: true,
      data: subcategorias,
    };
  } catch (error) {
    return handleServerActionError(error, 'getSubcategoriasByMateriaCategoriaAction', 'SUBCATEGORIA_ERROR');
  }
}

