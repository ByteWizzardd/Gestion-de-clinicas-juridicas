import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la auditoría de eliminación de acciones
 */
export const auditoriaEliminacionAccionesQueries = {
    /**
     * Obtiene todas las acciones eliminadas con filtros opcionales
     */
    getAll: async (filters?: {
        fechaInicio?: string;
        fechaFin?: string;
        idUsuario?: string;
        idCaso?: number;
        busqueda?: string;
        orden?: 'asc' | 'desc';
    }): Promise<Array<{
        id: number;
        num_accion: number;
        id_caso: number;
        detalle_accion: string | null;
        comentario: string | null;
        id_usuario_registra: string | null;
        fecha_registro: string | null;
        eliminado_por: string | null;
        motivo: string;
        fecha: string;
        ejecutores: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | string | null;
        tramite_caso: string | null;
        nombre_nucleo: string | null;
        nombres_solicitante: string | null;
        apellidos_solicitante: string | null;
        nombre_completo_solicitante: string | null;
        nombres_usuario_registra: string | null;
        apellidos_usuario_registra: string | null;
        nombre_completo_usuario_registra: string | null;
        nombres_eliminado_por: string | null;
        apellidos_eliminado_por: string | null;
        nombre_completo_eliminado_por: string | null;
        foto_perfil_eliminado_por: string | null;
    }>> => {
        const query = loadSQL('auditoria-eliminacion-acciones/get-all.sql');
        const result: QueryResult = await pool.query(query, [
            filters?.fechaInicio || null,
            filters?.fechaFin || null,
            filters?.idUsuario || null,
            filters?.idCaso || null,
            filters?.busqueda || null,
            filters?.orden || 'desc',
        ]);
        return result.rows.map(row => ({
            ...row,
            foto_perfil_eliminado_por: row.foto_perfil_eliminado_por
                ? `data:image/jpeg;base64,${(row.foto_perfil_eliminado_por as Buffer).toString('base64')}`
                : null,
        }));
    },

    /**
     * Obtiene el conteo total de acciones eliminadas
     */
    getCount: async (): Promise<number> => {
        const query = loadSQL('auditoria-eliminacion-acciones/get-count.sql');
        const result: QueryResult = await pool.query(query);
        return parseInt(result.rows[0].total, 10);
    },
};
