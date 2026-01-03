import { loadSQL } from "../sql-loader";
import { pool } from "../pool";
import { QueryResult } from "pg";

export interface Notificacion {
    id_notificacion: number;
    cedula_receptor: string;
    cedula_emisor: string;
    titulo: string;
    mensaje: string;
    fecha: Date;
    leida: boolean;
}

/**
 * Queries para la entidad Notificaciones
 * Todas las queries SQL están en database/queries/notificaciones/
 */
export const notificacionesQueries = {
    /**
     * Crea una nueva notificación
     * @param data Datos de la notificación a crear
     */
    create: async (data: {
        cedulaReceptor: string;
        cedulaEmisor: string;
        titulo: string;
        mensaje: string;
    }): Promise<unknown> => {
        const query = loadSQL('notificaciones/create.sql');
        const result: QueryResult = await pool.query(query, [
            data.cedulaReceptor,
            data.cedulaEmisor,
            data.titulo,
            data.mensaje,
        ]);
        return result.rows[0];
    },

    /**
     * Obtiene todas las notificaciones de un receptor
     */
    getByReceptor: async (cedulaReceptor: string): Promise<Notificacion[]> => {
        const query = loadSQL('notificaciones/get-by-receptor.sql');
        const result: QueryResult = await pool.query(query, [cedulaReceptor]);
        return result.rows as Notificacion[];
    },

    /**
     * Marca una notificación como leída (solo si pertenece al receptor)
     */
    markAsRead: async (idNotificacion: number, cedulaReceptor: string): Promise<{ id_notificacion: number } | null> => {
        const query = loadSQL('notificaciones/mark-as-read.sql');
        const result: QueryResult = await pool.query(query, [idNotificacion, cedulaReceptor]);
        return (result.rows[0] as { id_notificacion: number } | undefined) ?? null;
    },

    /**
     * Elimina una notificación (solo si pertenece al receptor)
     */
    delete: async (idNotificacion: number, cedulaReceptor: string): Promise<{ id_notificacion: number } | null> => {
        const query = loadSQL('notificaciones/delete.sql');
        const result: QueryResult = await pool.query(query, [idNotificacion, cedulaReceptor]);
        return (result.rows[0] as { id_notificacion: number } | undefined) ?? null;
    },
};