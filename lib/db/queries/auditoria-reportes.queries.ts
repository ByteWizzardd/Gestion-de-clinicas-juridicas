import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Interfaz para los filtros de auditoría aplicados a reportes
 */
export interface AuditoriaReportesFilters {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    tipoReporte?: string;
    orden?: 'asc' | 'desc';
}

/**
 * Interfaz para el registro de auditoría de reportes
 */
export interface AuditoriaReporteRecord {
    id: number;
    tipo_reporte: string;
    filtros_aplicados: Record<string, unknown> | null;
    formato: string;
    cedula_solicitante: string | null;
    fecha_generacion: string;
    id_usuario_genero: string;
    nombres_usuario_genero: string | null;
    apellidos_usuario_genero: string | null;
    nombre_completo_usuario_genero: string | null;
    foto_perfil_usuario_genero: string | null;
    nombres_solicitante: string | null;
    apellidos_solicitante: string | null;
    nombre_completo_solicitante: string | null;
}

/**
 * Interfaz para insertar un registro de auditoría de reporte
 */
export interface InsertAuditoriaReporteParams {
    tipoReporte: string;
    filtrosAplicados?: Record<string, unknown>;
    idUsuarioGenero: string;
    formato?: string;
    cedulaSolicitante?: string;
}

/**
 * Queries para la entidad AuditoriaReportes
 * Todas las queries SQL están en database/queries/auditoria-reportes/
 */
export const auditoriaReportesQueries = {
    /**
     * Inserta un nuevo registro de auditoría de reporte generado
     */
    insert: async (params: InsertAuditoriaReporteParams): Promise<number> => {
        const query = loadSQL('auditoria-reportes/insert.sql');
        const result: QueryResult = await pool.query(query, [
            params.tipoReporte,
            params.filtrosAplicados ? JSON.stringify(params.filtrosAplicados) : null,
            params.idUsuarioGenero,
            params.formato || 'PDF',
            params.cedulaSolicitante || null
        ]);
        return result.rows[0].id;
    },

    /**
     * Obtiene todos los reportes generados con filtros opcionales
     */
    getAll: async (filters?: AuditoriaReportesFilters): Promise<AuditoriaReporteRecord[]> => {
        const query = loadSQL('auditoria-reportes/get-all.sql');
        const result: QueryResult = await pool.query(query, [
            filters?.fechaInicio || null,
            filters?.fechaFin || null,
            filters?.idUsuario || null,
            filters?.tipoReporte || null,
            filters?.orden || 'desc',
        ]);
        // Convertir foto_perfil de Buffer a base64
        return result.rows.map(row => ({
            ...row,
            foto_perfil_usuario_genero: row.foto_perfil_usuario_genero
                ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_genero as Buffer).toString('base64')}`
                : null,
        }));
    },

    /**
     * Obtiene el conteo total de reportes generados
     */
    getCount: async (): Promise<number> => {
        const query = loadSQL('auditoria-reportes/get-count.sql');
        const result: QueryResult = await pool.query(query);
        return parseInt(result.rows[0].total, 10);
    },
};
