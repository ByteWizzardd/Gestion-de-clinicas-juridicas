import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la auditoría de actualización de acciones
 */
export const auditoriaActualizacionAccionesQueries = {
    /**
     * Obtiene todas las acciones actualizadas con filtros opcionales
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
        detalle_accion_anterior: string | null;
        comentario_anterior: string | null;
        id_usuario_registra_anterior: string | null;
        fecha_registro_anterior: string | null;
        detalle_accion_nuevo: string | null;
        comentario_nuevo: string | null;
        id_usuario_registra_nuevo: string | null;
        fecha_registro_nuevo: string | null;
        id_usuario_actualizo: string | null;
        fecha_actualizacion: string;
        ejecutores_anterior: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | string | null;
        ejecutores_nuevo: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | string | null;
        tramite_caso: string | null;
        nombre_nucleo: string | null;
        nombres_solicitante: string | null;
        apellidos_solicitante: string | null;
        nombre_completo_solicitante: string | null;
        nombres_usuario_actualizo: string | null;
        apellidos_usuario_actualizo: string | null;
        nombre_completo_usuario_actualizo: string | null;
        foto_perfil_usuario_actualizo: string | null;
    }>> => {
        const query = loadSQL('auditoria-actualizacion-acciones/get-all.sql');
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
            foto_perfil_usuario_actualizo: row.foto_perfil_usuario_actualizo
                ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_actualizo as Buffer).toString('base64')}`
                : null,
        }));
    },

    /**
     * Obtiene el conteo total de acciones actualizadas
     */
    getCount: async (): Promise<number> => {
        const query = loadSQL('auditoria-actualizacion-acciones/get-count.sql');
        const result: QueryResult = await pool.query(query);
        return parseInt(result.rows[0].total, 10);
    },
};
