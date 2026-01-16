'use server';

import { caracteristicasQueries } from '@/lib/db/queries/caracteristicas.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

export interface GetCaracteristicasResult {
  success: boolean;
  data?: Array<{ 
    id_tipo_caracteristica: number; 
    num_caracteristica: number; 
    descripcion: string;
    habilitado: boolean;
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function getCaracteristicasByTipoAction(idTipo: number): Promise<GetCaracteristicasResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const caracteristicas = await caracteristicasQueries.getByTipo(idTipo);

    return {
      success: true,
      data: caracteristicas,
    };
  } catch (error) {
    return handleServerActionError(error, 'getCaracteristicasByTipoAction', 'CARACTERISTICAS_ERROR');
  }
}

