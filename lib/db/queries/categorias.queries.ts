import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export interface Categoria {
  num_categoria: number;
  nombre_categoria: string;
}

/**
 * Queries para la entidad Categorías
 * Todas las queries SQL están en database/queries/categorias/
 */
export const categoriasQueries = {
  /**
   * Obtiene las categorías de una materia específica
   */
  getByMateria: async (idMateria: number): Promise<Categoria[]> => {
    const query = loadSQL('categorias/get-by-materia.sql');
    const result: QueryResult = await pool.query(query, [idMateria]);
    return result.rows;
  },
};

