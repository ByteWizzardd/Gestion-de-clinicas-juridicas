import { loadSQL } from '../../sql-loader';
import { pool } from '../../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Ámbitos Legales
 * Todas las queries SQL están en database/queries/ambitos-legales/
 */
export const ambitosLegalesQueries = {
  /**
   * Obtiene todos los ámbitos legales
   */
  getAll: async (): Promise<Array<{
    id_ambito_legal: number;
    materia: string;
    tipo: string;
    descripcion: string;
  }>> => {
    const query = loadSQL('ambitos-legales/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },
};

