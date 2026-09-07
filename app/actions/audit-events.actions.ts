'use server';

/**
 * Nuevas server actions del sistema de auditoría unificado (tabla auditoria_eventos).
 *
 * CONTRATO COMPARTIDO — ver types/audit-events.ts. Persona A (BD/backend) reemplaza
 * los cuerpos de estas funciones por la implementación real contra
 * lib/db/queries/auditoria-eventos.queries.ts una vez exista la tabla/migración.
 * Persona B (frontend) puede construir e integrar YA contra estas firmas: hoy
 * devuelven datos vacíos/mock, no errores, para no bloquear el build ni la UI.
 *
 * Cuando el backend esté listo, este archivo reemplaza y borra:
 *   - app/actions/audit.ts (68 exports)
 *   - app/actions/audit-general.ts
 */

import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { logger } from '@/lib/utils/logger';
import type {
  AuditoriaEvento,
  AuditoriaEventoFilters,
  AuditoriaEventoResumen,
  AuditoriaEventosPage,
} from '@/types/audit-events';

async function requireCoordinador() {
  const authResult = await requireAuthInServerActionWithCode();
  if (!authResult.success || !authResult.user) {
    throw new Error('No autorizado');
  }
  if (mapSystemRoleToSidebarRole(authResult.user.rol) !== 'coordinator') {
    throw new Error('No autorizado');
  }
  return authResult.user;
}

/** Feed paginado/filtrable de eventos de auditoría (reemplaza el UNION ALL viejo). */
export async function getAuditEventsAction(
  filters?: AuditoriaEventoFilters
): Promise<AuditoriaEventosPage> {
  await requireCoordinador();
  try {
    // TODO(backend): const { auditoriaEventosQueries } = await import('@/lib/db/queries/auditoria-eventos.queries');
    // return auditoriaEventosQueries.getEventos(filters);
    void filters;
    return { eventos: [], total: 0 };
  } catch (error) {
    logger.error('Error en getAuditEventsAction', error);
    return { eventos: [], total: 0 };
  }
}

/** Un evento puntual (para el detalle expandido). */
export async function getAuditEventDetailAction(id: number): Promise<AuditoriaEvento | null> {
  await requireCoordinador();
  try {
    // TODO(backend): const { auditoriaEventosQueries } = await import('@/lib/db/queries/auditoria-eventos.queries');
    // return auditoriaEventosQueries.getById(id);
    void id;
    return null;
  } catch (error) {
    logger.error('Error en getAuditEventDetailAction', error);
    return null;
  }
}

/** Contadores + última actividad por entidad/operación, para las tarjetas de módulo. */
export async function getAuditModuleSummaryAction(): Promise<AuditoriaEventoResumen[]> {
  await requireCoordinador();
  try {
    // TODO(backend): const { auditoriaEventosQueries } = await import('@/lib/db/queries/auditoria-eventos.queries');
    // return auditoriaEventosQueries.getResumenPorEntidad();
    return [];
  } catch (error) {
    logger.error('Error en getAuditModuleSummaryAction', error);
    return [];
  }
}
