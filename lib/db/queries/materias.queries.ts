import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export interface Materia {
  id_materia: number;
  nombre_materia: string;
}

/**
 * Queries para la entidad Materias
 * Todas las queries SQL están en database/queries/materias/
 */
export const materiasQueries = {
  /**
   * Obtiene todas las materias
   */
  getAll: async (): Promise<Materia[]> => {
    const query = loadSQL('materias/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },
};

