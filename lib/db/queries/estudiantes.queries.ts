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

  /**
   * Crea o actualiza un estudiante
   */
  createOrUpdate: async (data: {
    term: string;
    cedula_estudiante: string;
    tipo_estudiante: string;
    nrc: string;
  }): Promise<any> => {
    const query = loadSQL('estudiantes/create-or-update.sql');
    const result: QueryResult = await pool.query(query, [
      data.term,
      data.cedula_estudiante,
      data.tipo_estudiante,
      data.nrc,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene todos los estudiantes de un semestre específico
   */
  getByTerm: async (term: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string | null;
    telefono_celular: string | null;
    term: string;
    tipo_estudiante: string;
    nrc: string;
    habilitado_sistema: boolean;
  }>> => {
    const query = loadSQL('estudiantes/get-by-term.sql');
    const result: QueryResult = await pool.query(query, [term]);
    return result.rows;
  },

  /**
   * Obtiene todos los estudiantes activos de todos los semestres
   */
  getAllActive: async (): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string | null;
    telefono_celular: string | null;
    term: string;
    tipo_estudiante: string;
    nrc: string;
    habilitado_sistema: boolean;
  }>> => {
    const query = loadSQL('estudiantes/get-all-active.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },
};

