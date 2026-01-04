'use server';

import { categoriasQueries } from '@/lib/db/queries/categorias.queries';
import { AppError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

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
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const categorias = await categoriasQueries.getByMateria(idMateria);

    return {
      success: true,
      data: categorias,
    };
  } catch (error) {
    return handleServerActionError(error, 'getCategoriasByMateriaAction', 'CATEGORIA_ERROR');
  }
}

