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
   * @param habilitadosOnly Si es true, solo devuelve profesores habilitados
   */
  searchByCedula: async (cedula: string, habilitadosOnly: boolean = false): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
  }>> => {
    let query = loadSQL('profesores/search-by-cedula.sql');
    if (habilitadosOnly) {
      const parts = query.split('ORDER BY');
      if (parts.length > 1) {
        query = parts[0] + 'AND u.habilitado_sistema = true ORDER BY' + parts[1];
      }
    }
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

  /**
   * Obtiene profesores involucrados agrupados por materia (como tipos de caso)
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   */
  getByMateria: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date
  ): Promise<Array<{
    nombre_materia: string;
    nombre_categoria: string | null;
    nombre_subcategoria: string | null;
    cantidad_profesores: number
  }>> => {
    const query = loadSQL('asignaciones/get-profesores-by-materia.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
    ]);
    return result.rows;
  },

  /**
   * Crea un nuevo profesor
   */
  create: async (data: {
    cedula_profesor: string;
    term: string;
    tipo_profesor: string;
  }): Promise<any> => {
    const query = loadSQL('profesores/create.sql');
    const result: QueryResult = await pool.query(query, [
      data.cedula_profesor,
      data.term,
      data.tipo_profesor,
    ]);
    return result.rows[0];
  },
};

