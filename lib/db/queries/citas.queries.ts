import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Citas
 * Todas las queries SQL están en database/queries/citas/
 */
export const citasQueries = {
  /**
   * Obtiene todas las citas con información relacionada
   * Incluye: caso, solicitante, núcleo, ámbito legal
   */
  getAll: async (): Promise<any[]> => {
    const query = loadSQL('citas/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  async create(query: string, caseId: number, date: string, endDate: string | null, orientacion: string): Promise<any> {
    return await pool.query(query, [caseId, date, endDate, orientacion]);
  }
};


