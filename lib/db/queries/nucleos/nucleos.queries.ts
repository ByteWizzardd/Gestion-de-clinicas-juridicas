import { loadSQL } from '../../sql-loader';
import { pool } from '../../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Núcleos
 * Todas las queries SQL están en database/queries/nucleos/
 */
export const nucleosQueries = {
  /**
   * Obtiene todos los núcleos
   */
  getAll: async (): Promise<Array<{ id_nucleo: number; nombre_nucleo: string }>> => {
    const query = loadSQL('nucleos/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },
};

