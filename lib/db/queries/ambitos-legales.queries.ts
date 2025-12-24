import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Ámbitos Legales
 * Todas las queries SQL están en database/queries/ambitos-legales/
 */
export const ambitosLegalesQueries = {
  /**
   * Obtiene todos los ámbitos legales con información completa
   */
  getAll: async (): Promise<Array<{
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    num_ambito_legal: number;
    materia: string;
    categoria: string;
    subcategoria: string;
  }>> => {
    const query = loadSQL('ambitos-legales/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Verifica si un ámbito legal existe por su clave compuesta
   */
  checkExists: async (
    idMateria: number,
    numCategoria: number,
    numSubcategoria: number,
    numAmbitoLegal: number
  ): Promise<boolean> => {
    const query = loadSQL('ambitos-legales/check-exists.sql');
    const result: QueryResult = await pool.query(query, [
      idMateria,
      numCategoria,
      numSubcategoria,
      numAmbitoLegal,
    ]);
    return result.rows.length > 0;
  },

  /**
   * Obtiene los ámbitos legales de una materia, categoría y subcategoría específicas
   */
  getByMateriaCategoriaSubcategoria: async (
    idMateria: number,
    numCategoria: number,
    numSubcategoria: number
  ): Promise<Array<{
    num_ambito_legal: number;
    nombre_ambito_legal: string;
  }>> => {
    const query = loadSQL('ambitos-legales/get-by-materia-categoria-subcategoria.sql');
    const result: QueryResult = await pool.query(query, [
      idMateria,
      numCategoria,
      numSubcategoria,
    ]);
    return result.rows;
  },
};

