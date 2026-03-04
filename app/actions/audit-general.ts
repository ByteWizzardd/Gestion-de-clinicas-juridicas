'use server';

import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { loadSQL } from '@/lib/db/sql-loader';
import { pool } from '@/lib/db/pool';
import { logger } from '@/lib/utils/logger';

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
        orden?: string;
        busqueda?: string;
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
        const countQuery = loadSQL('audit/count-unified-logs.sql');
        const offset = (page - 1) * limit;

        const [results, countResult] = await Promise.all([
            pool.query(query, [
                limit,
                offset,
                filters?.entidad || null,
                filters?.usuarioId || null,
                filters?.operacion || null,
                filters?.fechaInicio || null,
                filters?.fechaFin || null,
                filters?.orden || 'desc',
                filters?.busqueda || null
            ]),
            pool.query(countQuery, [
                filters?.entidad || null,
                filters?.usuarioId || null,
                filters?.operacion || null,
                filters?.fechaInicio || null,
                filters?.fechaFin || null,
                filters?.busqueda || null
            ])
        ]);

        // Convert dates to ISO strings for serialization
        const logs = results.rows.map((row: any) => ({
            ...row,
            fecha: row.fecha ? new Date(row.fecha).toISOString() : null,
        }));

        const totalCount = parseInt(countResult.rows[0].count, 10);

        return { logs, totalCount };

    } catch (error: any) {
        logger.error('Error fetching unified audit logs:', error);
        throw new Error(`Error al obtener logs unificados de auditoría: ${error.message}`);
    }
}
