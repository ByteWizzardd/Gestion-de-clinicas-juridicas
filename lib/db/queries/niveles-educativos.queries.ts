import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export interface NivelEducativo {
  id_nivel_educativo: number;
  descripcion: string;
}

/**
 * Queries para la entidad Niveles Educativos
 * Todas las queries SQL están en database/queries/niveles-educativos/
 */
export const nivelesEducativosQueries = {
  /**
   * Obtiene todos los niveles educativos
   */
  getAll: async (): Promise<NivelEducativo[]> => {
    const query = loadSQL('niveles-educativos/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Crea un nuevo nivel educativo
   */
  create: async (data: {
    nivel: number;
    anosCursados: number;
    semestresCursados: number;
    trimestresCursados: number;
  }): Promise<any> => {
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

