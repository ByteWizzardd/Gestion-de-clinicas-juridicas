'use server';

import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { loadSQL } from '@/lib/db/sql-loader';
import { pool } from '@/lib/db/pool';

export interface UnifiedAuditLog {
    entidad: string;
    accion: string;
    fecha: string;
    usuario_id: string;
    usuario_nombre: string;
    detalles: string;
    metadata: string;
}

export async function getUnifiedAuditLogsAction(
    page: number = 1,
    limit: number = 50,
    filters?: {
        entidad?: string;
        usuarioId?: string;
        operacion?: string;
        fechaInicio?: string;
        fechaFin?: string;
    }
): Promise<{ logs: UnifiedAuditLog[], totalCount: number }> {
    const authResult = await requireAuthInServerActionWithCode();

    if (!authResult.success || !authResult.user) {
        throw new Error('No autorizado');
    }

    const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);
    if (userSidebarRole !== 'coordinator') {
        throw new Error('No autorizado');
    }

    try {
        const query = loadSQL('audit/get-unified-logs.sql');
        const offset = (page - 1) * limit;

        const result = await pool.query(query, [
            limit,
            offset,
            filters?.entidad || null,
            filters?.usuarioId || null,
            filters?.operacion || null,
            filters?.fechaInicio || null,
            filters?.fechaFin || null
        ]);

        // Convert dates to ISO strings for serialization
        const logs = result.rows.map((row: any) => ({
            ...row,
            fecha: row.fecha ? new Date(row.fecha).toISOString() : null,
        }));

        // TODO: Ideally we should have a count query as well, but for now we'll just return logs
        // A proper count across all unions is expensive, maybe just estimate or do a separate count query later
        const totalCount = 1000; // Placeholder until we add a count query

        return { logs, totalCount };

    } catch (error) {
        console.error('Error fetching unified audit logs:', error);
        throw new Error('Error al obtener logs unificados de auditoría');
    }
}
