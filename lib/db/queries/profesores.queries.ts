import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Profesores
 * Todas las queries SQL están en database/queries/profesores/
 */
export const profesoresQueries = {
  /**
   * Busca profesores por cédula (búsqueda parcial)
   */
  searchByCedula: async (cedula: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('profesores/search-by-cedula.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },

  /**
   * Obtiene todos los profesores de un semestre específico
   */
  getByTerm: async (term: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string | null;
    telefono_celular: string | null;
    term: string;
    tipo_profesor: string;
    habilitado_sistema: boolean;
  }>> => {
    const query = loadSQL('profesores/get-by-term.sql');
    const result: QueryResult = await pool.query(query, [term]);
    return result.rows;
  },

  /**
   * Obtiene todos los profesores activos de todos los semestres
   */
  getAllActive: async (): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string | null;
    telefono_celular: string | null;
    term: string;
    tipo_profesor: string;
    habilitado_sistema: boolean;
  }>> => {
    const query = loadSQL('profesores/get-all-active.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },
};

