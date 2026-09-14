import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';
import { logger } from '@/lib/utils/logger';
import { DatabaseError } from '@/lib/utils/errors';
import type { AuditoriaEvento, AuditoriaEventoFilters, AuditoriaEventosPage, AuditoriaEventoResumen } from '@/types/audit-events';

/** Orden de los parámetros de filtro (ver buildFilterParams). */
const FILTROS = ['entidad', 'usuario', 'operacion', 'fecha_inicio', 'fecha_fin', 'busqueda', 'tx_id', 'id_transaccion'] as const;

/**
 * Inserta el fragmento compartido audit/filtro-eventos.sql (FROM + WHERE) en
 * lugar de {{FILTRO_EVENTOS}} y numera sus parámetros a partir de
 * `primerParametro`. Con `primerParametro = null` todos los filtros quedan en
 * NULL (sin filtrar), para los contadores por módulo.
 */
function conFiltroEventos(sql: string, primerParametro: number | null): string {
    let filtro = loadSQL('audit/filtro-eventos.sql');
    FILTROS.forEach((nombre, i) => {
        filtro = filtro.split(`{{${nombre}}}`).join(primerParametro == null ? 'NULL' : `$${primerParametro + i}`);
    });
    // Reemplazo con función: con un string, replace() interpretaría los `$` del
    // fragmento ($3, $') como patrones de reemplazo y corrompería el SQL.
    return sql.replace('{{FILTRO_EVENTOS}}', () => filtro);
}

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

/**
 * auditoria_eventos.fecha_evento es TIMESTAMP (sin zona) y guarda la hora de
 * pared de Caracas (DEFAULT now() AT TIME ZONE 'America/Caracas'). `pg` lo
 * convierte a un Date interpretándolo en la zona local del proceso; usar
 * .toISOString() le agregaba una 'Z' (UTC) y el formateador del frontend,
 * que lee la hora literal del string, la mostraba desplazada (+4h en
 * Caracas). Se rearma el string con los componentes locales del Date, que
 * son exactamente los que venían de la BD, sin importar la TZ del servidor.
 */
export function timestampSinZona(value: unknown): string | null {
    if (value == null) return null;
    if (!(value instanceof Date)) return String(value);
    const pad = (n: number, len = 2) => String(n).padStart(len, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}.${pad(value.getMilliseconds(), 3)}`;
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
        nombre_nucleo_anterior: row.nombre_nucleo_anterior ?? undefined,
        nombre_nucleo_nuevo: row.nombre_nucleo_nuevo ?? undefined,
        nombre_materia_anterior: row.nombre_materia_anterior ?? undefined,
        nombre_materia_nuevo: row.nombre_materia_nuevo ?? undefined,
        nombre_categoria_anterior: row.nombre_categoria_anterior ?? undefined,
        nombre_categoria_nuevo: row.nombre_categoria_nuevo ?? undefined,
        nombre_subcategoria_anterior: row.nombre_subcategoria_anterior ?? undefined,
        nombre_subcategoria_nuevo: row.nombre_subcategoria_nuevo ?? undefined,
        nombre_ambito_legal_anterior: row.nombre_ambito_legal_anterior ?? undefined,
        nombre_ambito_legal_nuevo: row.nombre_ambito_legal_nuevo ?? undefined,
        nombre_solicitante_anterior: row.nombre_solicitante_anterior ?? undefined,
        nombre_solicitante_nuevo: row.nombre_solicitante_nuevo ?? undefined,
        nombre_materia: row.nombre_materia ?? undefined,
        nombre_categoria: row.nombre_categoria ?? undefined,
        nombre_subcategoria: row.nombre_subcategoria ?? undefined,
        nombre_tipo_caracteristica: row.nombre_tipo_caracteristica ?? undefined,
        nombre_estado: row.nombre_estado ?? undefined,
        nombre_municipio: row.nombre_municipio ?? undefined,
        nombre_estado_parroquia: row.nombre_estado_parroquia ?? undefined,
        nivel_educativo_anterior: row.nivel_educativo_anterior ?? undefined,
        nivel_educativo_nuevo: row.nivel_educativo_nuevo ?? undefined,
        condicion_trabajo_anterior: row.condicion_trabajo_anterior ?? undefined,
        condicion_trabajo_nuevo: row.condicion_trabajo_nuevo ?? undefined,
        condicion_actividad_anterior: row.condicion_actividad_anterior ?? undefined,
        condicion_actividad_nuevo: row.condicion_actividad_nuevo ?? undefined,
        solicitante_estado_anterior: row.solicitante_estado_anterior ?? undefined,
        solicitante_estado_nuevo: row.solicitante_estado_nuevo ?? undefined,
        solicitante_municipio_anterior: row.solicitante_municipio_anterior ?? undefined,
        solicitante_municipio_nuevo: row.solicitante_municipio_nuevo ?? undefined,
        solicitante_parroquia_anterior: row.solicitante_parroquia_anterior ?? undefined,
        solicitante_parroquia_nuevo: row.solicitante_parroquia_nuevo ?? undefined,
        datos_anteriores: row.datos_anteriores ?? null,
        datos_nuevos: row.datos_nuevos ?? null,
        metadata: row.metadata ?? null,
        fecha_evento: timestampSinZona(row.fecha) as string,
        ejecutores_evento: row.ejecutores_evento ?? undefined,
        usuarios_ref: row.usuarios_ref ?? undefined,
        nombres_resueltos: row.nombres_resueltos ?? undefined,
        solicitante_extra: row.solicitante_extra ?? undefined,
        atenciones_evento: row.atenciones_evento ?? undefined,
        inscripcion_extra: row.inscripcion_extra ?? undefined,
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
            // $1/$2 son limit/offset en el feed; el conteo no los lleva.
            const query = conFiltroEventos(loadSQL('audit/get-unified-logs.sql'), 3)
                .split('{{ORDEN}}').join(filters?.orden === 'asc' ? 'ASC' : 'DESC');
            const countQuery = conFiltroEventos(loadSQL('audit/count-unified-logs.sql'), 1);
            
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
            const query = conFiltroEventos(loadSQL('audit/get-resumen-entidad.sql'), null);
            const result = await pool.query(query);
            return result.rows.map((row: Record<string, any>) => ({
                entidad: row.entidad,
                operacion: row.operacion,
                total: row.total,
                ultima_actividad: timestampSinZona(row.ultima_actividad),
            }));
        } catch (error) {
            logger.error('Error en auditoriaEventosQueries.getResumenPorEntidad', error);
            throw new DatabaseError('Error al obtener resumen de auditoría', error);
        }
    }
};
