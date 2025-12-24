import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Cambios de Estatus
 * Todas las queries SQL están en database/queries/cambios-estatus/
 */
export const cambiosEstatusQueries = {
  /**
   * Registra un cambio de estatus para un caso
   * @param idCaso ID del caso
   * @param nuevoEstatus Nuevo estatus del caso
   * @param idUsuarioCambia Cédula del usuario que registra el cambio
   * @param motivo Motivo del cambio (opcional)
   * @param numCambio Número de cambio (opcional, se calcula automáticamente si es NULL)
   */
  create: async (
    idCaso: number,
    nuevoEstatus: string,
    idUsuarioCambia: string,
    motivo?: string,
    numCambio?: number
  ): Promise<any> => {
    const query = loadSQL('cambios-estatus/create.sql');
    const result: QueryResult = await pool.query(query, [
      idCaso,
      nuevoEstatus,
      idUsuarioCambia,
      motivo || null,
      numCambio || null,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene todos los cambios de estatus de un caso específico
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    num_cambio: number;
    id_caso: number;
    motivo: string | null;
    nuevo_estatus: string;
    fecha: string;
    id_usuario_cambia: string;
    nombres_usuario: string;
    apellidos_usuario: string;
    nombre_completo_usuario: string;
  }>> => {
    const query = loadSQL('cambios-estatus/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    return result.rows;
  },
};

