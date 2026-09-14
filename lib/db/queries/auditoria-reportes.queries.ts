import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Interfaz para insertar un registro de auditoría de reporte
 */
export interface InsertAuditoriaReporteParams {
    tipoReporte: string;
    filtrosAplicados?: Record<string, unknown>;
    idUsuarioGenero: string;
    formato?: string;
    cedulaSolicitante?: string;
    operacion?: 'generacion' | 'vista_previa';
}

/**
 * Queries para la auditoría de reportes.
 * Escriben directamente en auditoria_eventos (entidad='reporte') — la lectura
 * ya vive en auditoriaEventosQueries / getAuditEventsAction, ver
 * app/actions/audit.ts (getEventosHelper('reporte', ...)).
 */
export const auditoriaReportesQueries = {
    /**
     * Inserta un evento de auditoría de reporte generado/previsualizado.
     */
    insert: async (params: InsertAuditoriaReporteParams): Promise<number> => {
        const query = loadSQL('auditoria-reportes/insert.sql');
        const result: QueryResult = await pool.query(query, [
            params.tipoReporte,
            params.filtrosAplicados ? JSON.stringify(params.filtrosAplicados) : null,
            params.idUsuarioGenero,
            params.formato || 'PDF',
            params.cedulaSolicitante || null,
            params.operacion || 'generacion'
        ]);
        return result.rows[0].id;
    },
};
