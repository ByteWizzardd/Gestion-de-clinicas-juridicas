'use server';

import { materiasQueries } from '@/lib/db/queries/materias.queries';
import { AppError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

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
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const materias = await materiasQueries.getAll();

    return {
      success: true,
      data: materias,
    };
  } catch (error) {
    return handleServerActionError(error, 'getMateriasAction', 'MATERIA_ERROR');
  }
}

