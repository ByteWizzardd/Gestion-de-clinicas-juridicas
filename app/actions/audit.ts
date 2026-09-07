'use server';

import { auditoriaQueries } from '@/lib/db/queries/auditoria/get-eventos';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';

export interface GetAuditoriaResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

async function requireCoordinador() {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user || mapSystemRoleToSidebarRole(authResult.user.rol) !== 'coordinator') {
    throw new Error('No autorizado para ver la auditoría');
  }
  return authResult.user;
}

/**
 * Obtiene el historial global unificado de auditoría.
 */
export async function getAuditoriaEventosAction(limit = 1000): Promise<GetAuditoriaResult> {
  try {
    await requireCoordinador();

    const eventos = await auditoriaQueries.getAllEventos(limit);

    return {
      success: true,
      data: eventos
    };
  } catch (error: any) {
    console.error('Error en getAuditoriaEventosAction:', error);
    return {
      success: false,
      error: { message: error?.message || 'Error interno al obtener eventos de auditoría', code: 'UNAUTHORIZED' }
    };
  }
}

/**
 * Obtiene los contadores de auditoría para el dashboard principal.
 * Igual que getAuditoriaEventosAction, restringido a coordinadores.
 */
export async function getAuditCountsAction() {
  try {
    await requireCoordinador();

    return await auditoriaQueries.getAuditCounts();
  } catch (error) {
    console.error('Error en getAuditCountsAction:', error);
    throw new Error('Error al obtener los contadores de auditoría');
  }
}
