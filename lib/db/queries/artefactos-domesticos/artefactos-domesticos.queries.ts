import { loadSQL } from '../../sql-loader';
import { pool } from '../../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Artefactos Domésticos
 * Todas las queries SQL están en database/queries/artefactos-domesticos/
 */
export const artefactosDomesticosQueries = {
  /**
   * Crea artefactos domésticos para un hogar
   */
  create: async (idHogar: number, artefactos: string[]): Promise<any[]> => {
    const query = loadSQL('artefactos-domesticos/create.sql');
    const results: any[] = [];
    
    for (const artefacto of artefactos) {
      const result: QueryResult = await pool.query(query, [idHogar, artefacto]);
      if (result.rows[0]) {
        results.push(result.rows[0]);
      }
    }
    
    return results;
  },
};

