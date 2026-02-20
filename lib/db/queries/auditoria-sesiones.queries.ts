import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { DatabaseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export interface SesionAuditoria {
    id_sesion: number;
    cedula_usuario: string;
    fecha_inicio: Date;
    fecha_cierre: Date | null;
    ip_direccion: string | null;
    dispositivo: string | null;
    exitoso: boolean;
    nombres?: string;
    apellidos?: string;
    nombre_usuario?: string;
    detalle: string | null;
}

export type SortOrder = 'asc' | 'desc';

export const auditoriaSesionesQueries = {
    // ==========================================
    // TODAS LAS SESIONES
    // ==========================================
    getAll: async (limit: number = 50, offset: number = 0, sortOrder: SortOrder = 'desc', userId?: string, startDate?: Date, endDate?: Date): Promise<SesionAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-sesiones/get-all.sql');
            const result = await pool.query(query, [limit, offset, sortOrder, userId || null, startDate || null, endDate || null]);
            return result.rows;
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.getAll', error);
            throw new DatabaseError('Error al obtener sesiones', error);
        }
    },

    count: async (userId?: string, startDate?: Date, endDate?: Date): Promise<number> => {
        try {
            const query = loadSQL('auditoria-sesiones/count.sql');
            const result = await pool.query(query, [userId || null, startDate || null, endDate || null]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.count', error);
            throw new DatabaseError('Error al contar sesiones', error);
        }
    },

    search: async (searchTerm: string, limit: number = 50, offset: number = 0, sortOrder: SortOrder = 'desc', userId?: string, startDate?: Date, endDate?: Date): Promise<SesionAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-sesiones/search.sql');
            const result = await pool.query(query, [limit, offset, searchTerm, sortOrder, userId || null, startDate || null, endDate || null]);
            return result.rows;
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.search', error);
            throw new DatabaseError('Error al buscar sesiones', error);
        }
    },

    countSearch: async (searchTerm: string, userId?: string, startDate?: Date, endDate?: Date): Promise<number> => {
        try {
            const query = loadSQL('auditoria-sesiones/count-search.sql');
            const result = await pool.query(query, [searchTerm, userId || null, startDate || null, endDate || null]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.countSearch', error);
            throw new DatabaseError('Error al contar sesiones buscadas', error);
        }
    },

    // ==========================================
    // INICIOS DE SESIÓN (LOGINS - EXITOSOS)
    // ==========================================
    getLogins: async (limit: number = 50, offset: number = 0, sortOrder: SortOrder = 'desc', userId?: string, startDate?: Date, endDate?: Date): Promise<SesionAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-sesiones/get-logins.sql');
            const result = await pool.query(query, [limit, offset, sortOrder, userId || null, startDate || null, endDate || null]);
            return result.rows;
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.getLogins', error);
            throw new DatabaseError('Error al obtener logins', error);
        }
    },

    countLogins: async (userId?: string, startDate?: Date, endDate?: Date): Promise<number> => {
        try {
            const query = loadSQL('auditoria-sesiones/count-logins.sql');
            const result = await pool.query(query, [userId || null, startDate || null, endDate || null]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.countLogins', error);
            throw new DatabaseError('Error al contar logins', error);
        }
    },

    searchLogins: async (searchTerm: string, limit: number = 50, offset: number = 0, sortOrder: SortOrder = 'desc', userId?: string, startDate?: Date, endDate?: Date): Promise<SesionAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-sesiones/search-logins.sql');
            const result = await pool.query(query, [limit, offset, searchTerm, sortOrder, userId || null, startDate || null, endDate || null]);
            return result.rows;
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.searchLogins', error);
            throw new DatabaseError('Error al buscar logins', error);
        }
    },

    countSearchLogins: async (searchTerm: string, userId?: string, startDate?: Date, endDate?: Date): Promise<number> => {
        try {
            const query = loadSQL('auditoria-sesiones/count-search-logins.sql');
            const result = await pool.query(query, [searchTerm, userId || null, startDate || null, endDate || null]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.countSearchLogins', error);
            throw new DatabaseError('Error al contar logins buscados', error);
        }
    },

    // ==========================================
    // CIERRES DE SESIÓN (LOGOUTS)
    // ==========================================
    getLogouts: async (limit: number = 50, offset: number = 0, sortOrder: SortOrder = 'desc', userId?: string, startDate?: Date, endDate?: Date): Promise<SesionAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-sesiones/get-logouts.sql');
            const result = await pool.query(query, [limit, offset, sortOrder, userId || null, startDate || null, endDate || null]);
            return result.rows;
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.getLogouts', error);
            throw new DatabaseError('Error al obtener logouts', error);
        }
    },

    countLogouts: async (userId?: string, startDate?: Date, endDate?: Date): Promise<number> => {
        try {
            const query = loadSQL('auditoria-sesiones/count-logouts.sql');
            const result = await pool.query(query, [userId || null, startDate || null, endDate || null]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.countLogouts', error);
            throw new DatabaseError('Error al contar logouts', error);
        }
    },

    searchLogouts: async (searchTerm: string, limit: number = 50, offset: number = 0, sortOrder: SortOrder = 'desc', userId?: string, startDate?: Date, endDate?: Date): Promise<SesionAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-sesiones/search-logouts.sql');
            const result = await pool.query(query, [limit, offset, searchTerm, sortOrder, userId || null, startDate || null, endDate || null]);
            return result.rows;
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.searchLogouts', error);
            throw new DatabaseError('Error al buscar logouts', error);
        }
    },

    countSearchLogouts: async (searchTerm: string, userId?: string, startDate?: Date, endDate?: Date): Promise<number> => {
        try {
            const query = loadSQL('auditoria-sesiones/count-search-logouts.sql');
            const result = await pool.query(query, [searchTerm, userId || null, startDate || null, endDate || null]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.countSearchLogouts', error);
            throw new DatabaseError('Error al contar logouts buscados', error);
        }
    },

    // ==========================================
    // INTENTOS FALLIDOS (FAILED)
    // ==========================================
    getFailed: async (limit: number = 50, offset: number = 0, sortOrder: SortOrder = 'desc', userId?: string, startDate?: Date, endDate?: Date): Promise<SesionAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-sesiones/get-failed.sql');
            const result = await pool.query(query, [limit, offset, sortOrder, userId || null, startDate || null, endDate || null]);
            return result.rows;
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.getFailed', error);
            throw new DatabaseError('Error al obtener intentos fallidos', error);
        }
    },

    countFailed: async (userId?: string, startDate?: Date, endDate?: Date): Promise<number> => {
        try {
            const query = loadSQL('auditoria-sesiones/count-failed.sql');
            const result = await pool.query(query, [userId || null, startDate || null, endDate || null]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.countFailed', error);
            throw new DatabaseError('Error al contar intentos fallidos', error);
        }
    },

    searchFailed: async (searchTerm: string, limit: number = 50, offset: number = 0, sortOrder: SortOrder = 'desc', userId?: string, startDate?: Date, endDate?: Date): Promise<SesionAuditoria[]> => {
        try {
            const query = loadSQL('auditoria-sesiones/search-failed.sql');
            const result = await pool.query(query, [limit, offset, searchTerm, sortOrder, userId || null, startDate || null, endDate || null]);
            return result.rows;
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.searchFailed', error);
            throw new DatabaseError('Error al buscar intentos fallidos', error);
        }
    },

    countSearchFailed: async (searchTerm: string, userId?: string, startDate?: Date, endDate?: Date): Promise<number> => {
        try {
            const query = loadSQL('auditoria-sesiones/count-search-failed.sql');
            const result = await pool.query(query, [searchTerm, userId || null, startDate || null, endDate || null]);
            return parseInt(result.rows[0]?.count || '0', 10);
        } catch (error) {
            logger.error('Error en auditoriaSesionesQueries.countSearchFailed', error);
            throw new DatabaseError('Error al contar intentos fallidos buscados', error);
        }
    },
};
