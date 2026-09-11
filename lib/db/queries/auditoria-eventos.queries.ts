import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';
import { logger } from '@/lib/utils/logger';
import { DatabaseError } from '@/lib/utils/errors';
import type { AuditoriaEvento, AuditoriaEventoFilters, AuditoriaEventosPage, AuditoriaEventoResumen } from '@/types/audit-events';

function buildFilterParams(filters?: AuditoriaEventoFilters) {
    return [
        filters?.entidad || null,
        filters?.idUsuario || null,
        filters?.operacion || null,
        filters?.fechaInicio || null,
        filters?.fechaFin || null,
        filters?.busqueda || null,
        filters?.txId || null,
        filters?.idTransaccion || null,
    ];
}

function mapRow(row: Record<string, any>): AuditoriaEvento {
    return {
        id: Number(row.id ?? 0),
        id_transaccion: row.id_transaccion ? Number(row.id_transaccion) : undefined,
        entidad: row.entidad,
        operacion: row.operacion,
        id_entidad: row.id_entidad,
        id_usuario: row.usuario_id,
        nombre_completo_usuario: row.usuario_nombre,
        nombre_completo_solicitante: row.solicitante_nombre ?? undefined,
        datos_anteriores: row.datos_anteriores ?? null,
        datos_nuevos: row.datos_nuevos ?? null,
        metadata: row.metadata ?? null,
        fecha_evento: row.fecha instanceof Date ? row.fecha.toISOString() : row.fecha,
    };
}

export const auditoriaEventosQueries = {
    /**
     * Obtiene una página de eventos de auditoría unificados, con filtros y total.
     */
    getEventos: async (filters?: AuditoriaEventoFilters): Promise<AuditoriaEventosPage> => {
        const limit = filters?.limit ?? 20;
        const offset = filters?.offset ?? 0;
        try {
            const query = loadSQL('audit/get-unified-logs.sql');
            const countQuery = loadSQL('audit/count-unified-logs.sql');
            
            const params = buildFilterParams(filters);
            
            const [eventosResult, countResult]: [QueryResult, QueryResult] = await Promise.all([
                pool.query(query, [limit, offset, ...params]),
                pool.query(countQuery, params),
            ]);
            
            return {
                eventos: eventosResult.rows.map(mapRow),
                total: parseInt(countResult.rows[0]?.count || '0', 10),
            };
        } catch (error) {
            logger.error('Error en auditoriaEventosQueries.getEventos', error);
            throw new DatabaseError('Error al obtener eventos de auditoría', error);
        }
    },

    /**
     * Obtiene un evento específico por ID.
     */
    getById: async (id: number): Promise<AuditoriaEvento | null> => {
        try {
            // Utilizamos el mismo UNION ALL pero filtramos por ID.
            // Para simplificar, envolvemos la consulta cargada.
            const directQuery = loadSQL('audit/get-by-id.sql');
            const result = await pool.query(directQuery, [id]);
            
            if (result.rows.length === 0) return null;
            return mapRow(result.rows[0]);
        } catch (error) {
            logger.error('Error en auditoriaEventosQueries.getById', error);
            throw new DatabaseError('Error al obtener evento por ID', error);
        }
    },

    /**
     * Obtiene los eventos hermanos de una misma transacción de negocio.
     */
    getSiblingEvents: async (txId: string): Promise<AuditoriaEvento[]> => {
        try {
            const query = loadSQL('audit/get-sibling-events.sql');
            const result = await pool.query(query, [txId]);
            return result.rows.map(mapRow);
        } catch (error) {
            logger.error('Error en auditoriaEventosQueries.getSiblingEvents', error);
            throw new DatabaseError('Error al obtener eventos hermanos', error);
        }
    },

    /**
     * Obtiene los contadores para el dashboard de auditoría (tarjetas por módulo).
     */
    getResumenPorEntidad: async (): Promise<AuditoriaEventoResumen[]> => {
        try {
            const query = loadSQL('audit/get-resumen-entidad.sql');
            const result = await pool.query(query);
            return result.rows.map((row: Record<string, any>) => ({
                entidad: row.entidad,
                operacion: row.operacion,
                total: row.total,
                ultima_actividad: row.ultima_actividad instanceof Date ? row.ultima_actividad.toISOString() : row.ultima_actividad,
            }));
        } catch (error) {
            logger.error('Error en auditoriaEventosQueries.getResumenPorEntidad', error);
            throw new DatabaseError('Error al obtener resumen de auditoría', error);
        }
    }
};
