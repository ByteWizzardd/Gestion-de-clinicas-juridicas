import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';
import { logger } from '@/lib/utils/logger';
import { DatabaseError } from '@/lib/utils/errors';

/**
 * Queries para la auditoría de descargas de soportes.
 * Escriben directamente en auditoria_eventos (entidad='soporte',
 * operacion='descarga_soporte') — la lectura ya vive en
 * auditoriaEventosQueries / getAuditEventsAction, ver
 * app/actions/audit.ts (getEventosHelper('soporte', 'descarga_soporte', ...)).
 */
export const auditoriaDescargaSoportesQueries = {
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
