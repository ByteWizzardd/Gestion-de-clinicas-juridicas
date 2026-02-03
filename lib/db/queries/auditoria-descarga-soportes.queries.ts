import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';
import { logger } from '@/lib/utils/logger';
import { DatabaseError } from '@/lib/utils/errors';

// Tipo para los registros de auditoría de descargas
export interface DescargaSoporteAuditoria {
    id: number;
    num_soporte: number;
    id_caso: number;
    nombre_archivo: string;
    cedula_descargo: string;
    ip_direccion: string | null;
    fecha_descarga: string; // Returned as string from SQL via to_char
    nombres_usuario_descargo: string | null;
    apellidos_usuario_descargo: string | null;
    nombre_completo_usuario_descargo: string | null;
    foto_perfil_usuario_descargo: string | null;
}

type SortOrder = 'asc' | 'desc';

/**
 * Queries para la entidad AuditoriaDescargaSoportes
 * Todas las queries SQL están en database/queries/auditoria-descarga-soportes/
 */
export const auditoriaDescargaSoportesQueries = {
    /**
     * Obtiene todos los registros de descargas con paginación y filtros
     */
    getAll: async (
        limit: number = 50,
        offset: number = 0,
        sortOrder: SortOrder = 'desc',
        userId?: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<DescargaSoporteAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-descarga-soportes/get-all.sql');
            const result: QueryResult = await pool.query(query, [
                limit,
                offset,
                sortOrder,
                userId || null,
                startDate || null,
                endDate || null
            ]);
            return result.rows.map(row => ({
                ...row,
                foto_perfil_usuario_descargo: row.foto_perfil_usuario_descargo
                    ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_descargo as Buffer).toString('base64')}`
                    : null,
            }));
        } catch (error) {
            logger.error('Error en auditoriaDescargaSoportesQueries.getAll', error);
            throw new DatabaseError('Error al obtener descargas de soportes', error);
        }
    },

    /**
     * Cuenta el total de registros con filtros
     */
    count: async (
        userId?: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<number> => {
        try {
            const query = loadSQL('auditoria-descarga-soportes/count.sql');
            const result: QueryResult = await pool.query(query, [
                userId || null,
                startDate || null,
                endDate || null
            ]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaDescargaSoportesQueries.count', error);
            throw new DatabaseError('Error al contar descargas de soportes', error);
        }
    },

    /**
     * Busca registros por término con paginación y filtros
     */
    search: async (
        searchTerm: string,
        limit: number = 50,
        offset: number = 0,
        sortOrder: SortOrder = 'desc',
        userId?: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<DescargaSoporteAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-descarga-soportes/search.sql');
            const result: QueryResult = await pool.query(query, [
                searchTerm,
                limit,
                offset,
                sortOrder,
                userId || null,
                startDate || null,
                endDate || null
            ]);
            return result.rows.map(row => ({
                ...row,
                foto_perfil_usuario_descargo: row.foto_perfil_usuario_descargo
                    ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_descargo as Buffer).toString('base64')}`
                    : null,
            }));
        } catch (error) {
            logger.error('Error en auditoriaDescargaSoportesQueries.search', error);
            throw new DatabaseError('Error al buscar descargas de soportes', error);
        }
    },

    /**
     * Cuenta resultados de búsqueda con filtros
     */
    countSearch: async (
        searchTerm: string,
        userId?: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<number> => {
        try {
            const query = loadSQL('auditoria-descarga-soportes/count-search.sql');
            const result: QueryResult = await pool.query(query, [
                searchTerm,
                userId || null,
                startDate || null,
                endDate || null
            ]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaDescargaSoportesQueries.countSearch', error);
            throw new DatabaseError('Error al contar búsqueda de descargas', error);
        }
    },

    /**
     * Obtiene descargas por caso específico
     */
    getByCaso: async (idCaso: number): Promise<DescargaSoporteAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-descarga-soportes/get-by-caso.sql');
            const result: QueryResult = await pool.query(query, [idCaso]);
            return result.rows.map(row => ({
                ...row,
                foto_perfil_usuario_descargo: row.foto_perfil_usuario_descargo
                    ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_descargo as Buffer).toString('base64')}`
                    : null,
            }));
        } catch (error) {
            logger.error('Error en auditoriaDescargaSoportesQueries.getByCaso', error);
            throw new DatabaseError('Error al obtener descargas por caso', error);
        }
    },

    /**
     * Registra una descarga de soporte (inserción directa, no por trigger)
     */
    registrarDescarga: async (
        numSoporte: number,
        idCaso: number,
        nombreArchivo: string,
        cedulaDescargo: string,
        ipDireccion: string | null
    ): Promise<{ id: number; fecha_descarga: Date }> => {
        try {
            const query = loadSQL('auditoria-descarga-soportes/insert.sql');
            const result: QueryResult = await pool.query(query, [
                numSoporte,
                idCaso,
                nombreArchivo,
                cedulaDescargo,
                ipDireccion
            ]);
            return result.rows[0];
        } catch (error) {
            logger.error('Error en auditoriaDescargaSoportesQueries.registrarDescarga', error);
            throw new DatabaseError('Error al registrar descarga de soporte', error);
        }
    },
};
