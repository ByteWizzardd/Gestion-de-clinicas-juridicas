'use server';

import { auditoriaQueries } from '@/lib/db/queries/auditoria/get-eventos';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export interface UnifiedAuditLog {
  entidad: string;
  accion: string;
  fecha: string;
  usuario_id: string;
  usuario_nombre: string;
  detalles: string;
  metadata: any;
}

export interface GetUnifiedAuditLogsResult {
    logs: UnifiedAuditLog[];
    totalCount: number;
}

export async function getUnifiedAuditLogsAction(
    page: number = 1,
    limit: number = 10,
    filters?: {
        entidad?: string;
        usuario_id?: string;
        accion?: string;
        fecha_inicio?: string;
        fecha_fin?: string;
        busqueda?: string;
    }
): Promise<GetUnifiedAuditLogsResult> {
    try {
        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            throw new Error('No autorizado');
        }

        const offset = (page - 1) * limit;

        const [logs, totalCount] = await Promise.all([
            auditoriaQueries.getAllEventos(limit, offset, filters),
            auditoriaQueries.countEventos(filters)
        ]);

        return {
            logs: logs as UnifiedAuditLog[],
            totalCount
        };
    } catch (error) {
        console.error('Error en getUnifiedAuditLogsAction:', error);
        throw new Error('Error al obtener los registros de auditoría');
    }
}
