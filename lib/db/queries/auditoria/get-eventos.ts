import { loadSQL } from '../../sql-loader';
import { pool } from '../../pool';
import { QueryResult } from 'pg';
import { logger } from '@/lib/utils/logger';
import { DatabaseError } from '@/lib/utils/errors';
import type { AuditCounts } from '@/types/audit';

export const auditoriaQueries = {
    /**
     * Obtiene todos los eventos de auditoría unificados
     */
    getAllEventos: async (
        limit: number = 1000,
        offset: number = 0,
        filters?: {
            entidad?: string;
            usuario_id?: string;
            accion?: string;
            fecha_inicio?: string;
            fecha_fin?: string;
            busqueda?: string;
        }
    ): Promise<any[]> => {
        try {
            const query = loadSQL('audit/get-unified-logs.sql');
            const result: QueryResult = await pool.query(query, [
                limit,
                offset,
                filters?.entidad || null,
                filters?.usuario_id || null,
                filters?.accion || null,
                filters?.fecha_inicio || null,
                filters?.fecha_fin || null,
                filters?.busqueda || null
            ]);
            return result.rows;
        } catch (error) {
            logger.error('Error en auditoriaQueries.getAllEventos', error);
            throw new DatabaseError('Error al obtener eventos de auditoría', error);
        }
    },

    /**
     * Cuenta el total de registros de auditoría unificados con filtros
     */
    countEventos: async (
        filters?: {
            entidad?: string;
            usuario_id?: string;
            accion?: string;
            fecha_inicio?: string;
            fecha_fin?: string;
            busqueda?: string;
        }
    ): Promise<number> => {
        try {
            const query = loadSQL('audit/count-unified-logs.sql');
            const result: QueryResult = await pool.query(query, [
                filters?.entidad || null,
                filters?.usuario_id || null,
                filters?.accion || null,
                filters?.fecha_inicio || null,
                filters?.fecha_fin || null,
                filters?.busqueda || null
            ]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaQueries.countEventos', error);
            throw new DatabaseError('Error al contar eventos de auditoría', error);
        }
    },

    /**
     * Obtiene los contadores para el dashboard de auditoría
     */
    getAuditCounts: async (): Promise<AuditCounts> => {
        try {
            const query = loadSQL('audit/get-audit-counts.sql');
            const result: QueryResult = await pool.query(query);
            
            // Map the big row back to numbers
            const row = result.rows[0];
            const counts: any = {};
            for (const key in row) {
                counts[key] = parseInt(row[key] || '0', 10);
            }
            
            // lastActivities can be empty object or fetched separately if needed
            counts.lastActivities = {};
            
            return counts as AuditCounts;
        } catch (error) {
            logger.error('Error en auditoriaQueries.getAuditCounts', error);
            throw new DatabaseError('Error al obtener contadores de auditoría', error);
        }
    }
};
