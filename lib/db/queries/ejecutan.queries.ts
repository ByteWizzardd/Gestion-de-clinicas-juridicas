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

  /**
   * Elimina todos los ejecutores de una acción específica
   */
  deleteByAccion: async (numAccion: number, idCaso: number): Promise<void> => {
    const query = loadSQL('ejecutan/delete-by-accion.sql');
    await pool.query(query, [numAccion, idCaso]);
  },
};