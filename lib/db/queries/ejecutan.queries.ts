import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Ejecutan
 * Todas las queries SQL están en database/queries/ejecutan/
 */
export const ejecutanQueries = {
  /**
   * Crea un registro de ejecución (usuario que ejecutó una acción)
   */
  create: async (
    idUsuarioEjecuta: string,
    numAccion: number,
    idCaso: number,
    fechaEjecucion: Date
  ): Promise<any> => {
    const query = loadSQL('ejecutan/create.sql');
    const result: QueryResult = await pool.query(query, [
      idUsuarioEjecuta,
      numAccion,
      idCaso,
      fechaEjecucion,
    ]);
    return result.rows[0];
  },
};