import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export interface Subcategoria {
  num_subcategoria: number;
  nombre_subcategoria: string;
}

/**
 * Queries para la entidad Subcategorías
 * Todas las queries SQL están en database/queries/subcategorias/
 */
export const subcategoriasQueries = {
  /**
   * Obtiene las subcategorías de una materia y categoría específicas
   */
  getByMateriaCategoria: async (
    idMateria: number,
    numCategoria: number
  ): Promise<Subcategoria[]> => {
    const query = loadSQL('subcategorias/get-by-materia-categoria.sql');
    const result: QueryResult = await pool.query(query, [idMateria, numCategoria]);
    return result.rows;
  },
};

