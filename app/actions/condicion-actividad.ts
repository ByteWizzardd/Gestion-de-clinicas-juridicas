'use server';

import { condicionActividadQueries } from '@/lib/db/queries/condicion-actividad.queries';
import { AppError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

export interface GetCondicionActividadResult {
  success: boolean;
  data?: Array<{ id_actividad: number; nombre_actividad: string; habilitado?: boolean }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function getCondicionActividadAction(): Promise<GetCondicionActividadResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const condiciones = await condicionActividadQueries.getAll();

    return {
      success: true,
      data: condiciones,
    };
  } catch (error) {
    return handleServerActionError(error, 'getCondicionActividadAction', 'CONDICION_ACTIVIDAD_ERROR');
  }
}

