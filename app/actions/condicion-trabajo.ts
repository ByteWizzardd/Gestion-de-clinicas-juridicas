'use server';

import { condicionTrabajoQueries } from '@/lib/db/queries/condicion-trabajo.queries';
import { AppError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

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
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const condiciones = await condicionTrabajoQueries.getAll();

    return {
      success: true,
      data: condiciones,
    };
  } catch (error) {
    return handleServerActionError(error, 'getCondicionTrabajoAction', 'CONDICION_TRABAJO_ERROR');
  }
}

