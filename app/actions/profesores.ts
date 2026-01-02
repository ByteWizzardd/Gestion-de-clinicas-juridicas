'use server';

import { profesoresQueries } from '@/lib/db/queries/profesores.queries';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

export interface SearchProfesoresResult {
  success: boolean;
  data?: unknown[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para buscar profesores por cédula
 */
export async function searchProfesoresAction(query: string): Promise<SearchProfesoresResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const profesores = await profesoresQueries.searchByCedula(query.trim());

    return {
      success: true,
      data: profesores,
    };
  } catch (error) {
    return handleServerActionError(error, 'searchProfesoresAction', 'PROFESOR_ERROR');
  }
}