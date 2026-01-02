import { loadSQL } from "../sql-loader";
import { pool } from "../pool";
import { QueryResult } from "pg";

export interface Notificacion {
  id_notificacion: number;
  cedula_receptor: string;
  cedula_emisor: string;
  titulo: string;
  mensaje: string;
  fecha_creacion: Date;
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
};