import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Niveles Educativos
 * Todas las queries SQL están en database/queries/niveles-educativos/
 */
export const nivelesEducativosQueries = {
  /**
   * Crea un nuevo nivel educativo
   */
  create: async (data: {
    nivel: number;
    anosCursados: number;
    semestresCursados: number;
    trimestresCursados: number;
  }): Promise<unknown> => {
    const query = loadSQL('niveles-educativos/create.sql');
    const result: QueryResult = await pool.query(query, [
      data.nivel,
      data.anosCursados,
      data.semestresCursados,
      data.trimestresCursados,
    ]);
    return result.rows[0];
  },
};

