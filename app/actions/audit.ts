'use server';

import { auditoriaQueries } from '@/lib/db/queries/auditoria/get-eventos';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export interface GetAuditoriaResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Obtiene el historial global unificado de auditoría.
 */
export async function getAuditoriaEventosAction(limit = 1000): Promise<GetAuditoriaResult> {
  try {
    const authResult = await requireAuthInServerActionWithCode();
    
    // Solo permitimos el acceso a coordinadores (o según tu lógica de roles)
    if (!authResult.success || !authResult.user || authResult.user.rol !== 'Coordinador') {
      return {
        success: false,
        error: { message: 'No autorizado para ver la auditoría', code: 'UNAUTHORIZED' }
      };
    }

    const eventos = await auditoriaQueries.getAllEventos(limit);

    return {
      success: true,
      data: eventos
    };
  } catch (error: any) {
    console.error('Error en getAuditoriaEventosAction:', error);
    return {
      success: false,
      error: { message: 'Error interno al obtener eventos de auditoría' }
    };
  }
}

/**
 * Obtiene los contadores de auditoría para el dashboard principal
 */
export async function getAuditCountsAction() {
  try {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      throw new Error('No autorizado');
    }

    return await auditoriaQueries.getAuditCounts();
  } catch (error) {
    console.error('Error en getAuditCountsAction:', error);
    throw new Error('Error al obtener los contadores de auditoría');
  }
}
