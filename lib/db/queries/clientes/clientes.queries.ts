import { loadSQL } from '../../sql-loader';
import { pool } from '../../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Clientes
 * Todas las queries SQL están en database/queries/clientes/
 */
export const clientesQueries = {
  /**
   * Busca clientes por cédula (búsqueda parcial)
   */
  searchByCedula: async (cedula: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('clientes/search-by-cedula.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },
};

