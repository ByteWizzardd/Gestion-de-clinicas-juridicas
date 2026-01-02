'use server';

import { nucleosQueries } from '@/lib/db/queries/nucleos.queries';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

export interface GetNucleosResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener todos los núcleos
 */
export async function getNucleosAction(): Promise<GetNucleosResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const nucleos = await nucleosQueries.getAll();

    return {
      success: true,
      data: nucleos,
    };
  } catch (error) {
    return handleServerActionError(error, 'getNucleosAction', 'NUCLEO_ERROR');
  }
}

