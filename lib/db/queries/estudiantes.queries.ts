import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Estudiantes
 * Todas las queries SQL están en database/queries/estudiantes/
 */
export const estudiantesQueries = {
  /**
   * Busca estudiantes por cédula (búsqueda parcial)
   */
  searchByCedula: async (cedula: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('estudiantes/search-by-cedula.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },
};

