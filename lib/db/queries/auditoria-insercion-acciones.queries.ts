import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la auditoría de inserción de acciones
 */
export const auditoriaInsercionAccionesQueries = {
    /**
     * Obtiene todas las acciones creadas con filtros opcionales
     */
    getAll: async (filters?: {
        fechaInicio?: string;
        fechaFin?: string;
        idUsuario?: string;
        idCaso?: number;
        orden?: 'asc' | 'desc';
    }): Promise<Array<{
        id: number;
        num_accion: number;
        id_caso: number;
        detalle_accion: string;
        comentario: string | null;
        id_usuario_registra: string | null;
        fecha_registro: string | null;
        id_usuario_creo: string | null;
        fecha_creacion: string;
        tramite_caso: string | null;
        nombre_nucleo: string | null;
        nombres_solicitante: string | null;
        apellidos_solicitante: string | null;
        nombre_completo_solicitante: string | null;
        nombres_usuario_registra: string | null;
        apellidos_usuario_registra: string | null;
        nombre_completo_usuario_registra: string | null;
        nombres_usuario_creo: string | null;
        apellidos_usuario_creo: string | null;
        nombre_completo_usuario_creo: string | null;
        foto_perfil_usuario_creo: string | null;
        ejecutores: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | string | null;
    }>> => {
        const query = loadSQL('auditoria-insercion-acciones/get-all.sql');
        const result: QueryResult = await pool.query(query, [
            filters?.fechaInicio || null,
            filters?.fechaFin || null,
            filters?.idUsuario || null,
            filters?.idCaso || null,
            filters?.orden || 'desc',
        ]);
        return result.rows.map(row => ({
            ...row,
            foto_perfil_usuario_creo: row.foto_perfil_usuario_creo
                ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_creo as Buffer).toString('base64')}`
                : null,
        }));
    },

    /**
     * Obtiene el conteo total de acciones creadas
     */
    getCount: async (): Promise<number> => {
        const query = loadSQL('auditoria-insercion-acciones/get-count.sql');
        const result: QueryResult = await pool.query(query);
        return parseInt(result.rows[0].total, 10);
    },
};
