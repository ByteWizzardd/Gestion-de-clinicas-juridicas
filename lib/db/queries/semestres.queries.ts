import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Semestres
 * Todas las queries SQL están en database/queries/semestres/
 */
export const semestresQueries = {
  /**
   * Obtiene todos los semestres ordenados por term descendente
   */
  getAll: async (): Promise<Array<{
    term: string;
    fecha_inicio: Date;
    fecha_fin: Date;
  }>> => {
    const query = loadSQL('semestres/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Obtiene un semestre por su term
   */
  getByTerm: async (term: string): Promise<{
    term: string;
    fecha_inicio: Date;
    fecha_fin: Date;
  } | null> => {
    const query = loadSQL('semestres/get-by-term.sql');
    const result: QueryResult = await pool.query(query, [term]);
    return result.rows[0] || null;
  },
};

