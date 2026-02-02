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

    /**
     * Elimina notificaciones más antiguas que un intervalo (TTL)
     * @param days Cantidad de días (ej: 30)
     * @returns cantidad de filas eliminadas
     */
    deleteOlderThan: async (days: number): Promise<number> => {
        const query = loadSQL('notificaciones/delete-older-than.sql');
        const result: QueryResult = await pool.query(query, [days]);
        return result.rowCount ?? 0;
    },

    /**
     * Obtiene receptores (usuarios habilitados) relacionados con los casos donde participa el usuario dado.
     */
    getReceptoresPorCasosDelUsuario: async (cedulaReceptor: string): Promise<string[]> => {
        const query = loadSQL('notificaciones/get-receptores-por-casos-del-usuario.sql');
        const result: QueryResult = await pool.query(query, [cedulaReceptor]);
        return (result.rows as Array<{ cedula: string }>).map(r => r.cedula);
    },

    /**
     * Verifica si existe una notificación (leída o no) con el mismo título y mensaje para un receptor
     * @returns true si existe una notificación idéntica
     */
    existsUnread: async (data: {
        cedulaReceptor: string;
        titulo: string;
        mensaje: string;
    }): Promise<boolean> => {
        const query = loadSQL('notificaciones/exists-unread.sql');
        const result: QueryResult = await pool.query(query, [
            data.cedulaReceptor,
            data.titulo,
            data.mensaje,
        ]);
        return result.rows.length > 0;
    },
};