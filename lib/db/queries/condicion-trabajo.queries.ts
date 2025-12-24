import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export interface CondicionTrabajo {
  id_trabajo: number;
  nombre_trabajo: string;
}

/**
 * Queries para la entidad CondicionTrabajo
 * Todas las queries SQL están en database/queries/condicion-trabajo/
 */
export const condicionTrabajoQueries = {
  /**
   * Obtiene todas las condiciones de trabajo
   */
  getAll: async (): Promise<CondicionTrabajo[]> => {
    const query = loadSQL('condicion-trabajo/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },
};

