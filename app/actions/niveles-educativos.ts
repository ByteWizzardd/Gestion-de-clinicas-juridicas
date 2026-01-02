'use server';

import { nivelesEducativosQueries } from '@/lib/db/queries/niveles-educativos.queries';
import { AppError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

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
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const nivelesEducativos = await nivelesEducativosQueries.getAll();

    return {
      success: true,
      data: nivelesEducativos,
    };
  } catch (error) {
    return handleServerActionError(error, 'getNivelesEducativosAction', 'NIVELES_EDUCATIVOS_ERROR');
  }
}

