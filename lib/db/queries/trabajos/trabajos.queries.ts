import { loadSQL } from '../../sql-loader';
import { pool } from '../../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Trabajos
 * Todas las queries SQL están en database/queries/trabajos/
 */
export const trabajosQueries = {
  /**
   * Crea un nuevo trabajo
   */
  create: async (data: {
    condicionActividad?: string | null;
    buscandoTrabajo: boolean;
    condicionTrabajo?: string | null;
  }): Promise<any> => {
    const query = loadSQL('trabajos/create.sql');
    const result: QueryResult = await pool.query(query, [
      data.condicionActividad || null,
      data.buscandoTrabajo,
      data.condicionTrabajo || null,
    ]);
    return result.rows[0];
  },
};

