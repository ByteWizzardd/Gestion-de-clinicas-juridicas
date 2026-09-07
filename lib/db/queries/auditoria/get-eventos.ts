import { loadSQL } from '../../sql-loader';
import { pool } from '../../pool';
import { QueryResult } from 'pg';
import { logger } from '@/lib/utils/logger';
import { DatabaseError } from '@/lib/utils/errors';
import type { AuditCounts } from '@/types/audit';
import type { AuditoriaEvento, AuditoriaEventoFilters, AuditoriaEventosPage } from '@/types/audit-events';

function buildFilterParams(filters?: AuditoriaEventoFilters) {
    return [
        filters?.entidad || null,
        filters?.idUsuario || null,
        filters?.operacion || null,
        filters?.fechaInicio || null,
        filters?.fechaFin || null,
        filters?.busqueda || null,
    ];
}

function mapRow(row: any): AuditoriaEvento {
    return {
        id: Number(row.id ?? 0),
        entidad: row.entidad,
        operacion: row.operacion,
        id_entidad: row.id_entidad,
        id_usuario: row.usuario_id,
        nombre_completo_usuario: row.usuario_nombre,
        datos_anteriores: row.datos_anteriores ?? null,
        datos_nuevos: row.datos_nuevos ?? null,
        metadata: row.metadata ?? null,
        fecha_evento: row.fecha instanceof Date ? row.fecha.toISOString() : row.fecha,
    };
}

export const auditoriaQueries = {
    /**
     * Obtiene una página de eventos de auditoría unificados, con filtros y total.
     */
    getEventos: async (filters?: AuditoriaEventoFilters): Promise<AuditoriaEventosPage> => {
        const limit = filters?.limit ?? 20;
        const offset = filters?.offset ?? 0;
        try {
            const query = loadSQL('audit/get-unified-logs.sql');
            const countQuery = loadSQL('audit/count-unified-logs.sql');
            const [eventosResult, countResult]: [QueryResult, QueryResult] = await Promise.all([
                pool.query(query, [limit, offset, ...buildFilterParams(filters)]),
                pool.query(countQuery, buildFilterParams(filters)),
            ]);
            return {
                eventos: eventosResult.rows.map(mapRow),
                total: parseInt(countResult.rows[0]?.count || '0', 10),
            };
        } catch (error) {
            logger.error('Error en auditoriaQueries.getEventos', error);
            throw new DatabaseError('Error al obtener eventos de auditoría', error);
        }
    },

    /**
     * Obtiene los contadores para el dashboard de auditoría (tarjetas por módulo).
     */
    getAuditCounts: async (): Promise<AuditCounts> => {
        try {
            const query = loadSQL('audit/get-audit-counts.sql');
            const result: QueryResult = await pool.query(query);

            const row = result.rows[0];
            const counts: any = {};
            for (const key in row) {
                counts[key] = parseInt(row[key] || '0', 10);
            }

            counts.lastActivities = {};

            return counts as AuditCounts;
        } catch (error) {
            logger.error('Error en auditoriaQueries.getAuditCounts', error);
            throw new DatabaseError('Error al obtener contadores de auditoría', error);
        }
    }
};
