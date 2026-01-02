import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para asignaciones (equipo asignado a casos)
 * Todas las queries SQL están en database/queries/asignaciones/
 */
export const asignacionesQueries = {
  /**
   * Obtiene el equipo asignado a un caso (profesores y estudiantes)
   */
  getEquipoByCaso: async (idCaso: number): Promise<Array<{
    tipo: 'profesor' | 'estudiante';
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string | null;
    telefono_celular: string | null;
    term: string | null;
    habilitado: boolean;
    rol: string;
  }>> => {
    const query = loadSQL('asignaciones/get-equipo-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    return result.rows;
  },

  /**
   * Crea o actualiza asignación de profesor supervisor
   */
  createSupervisa: async (
    term: string,
    cedulaProfesor: string,
    idCaso: number,
    habilitado: boolean = true
  ): Promise<any> => {
    const query = loadSQL('asignaciones/create-supervisa.sql');
    const result: QueryResult = await pool.query(query, [
      term,
      cedulaProfesor,
      idCaso,
      habilitado,
    ]);
    return result.rows[0];
  },

  /**
   * Crea o actualiza asignación de estudiante
   */
  createSeLeAsigna: async (
    term: string,
    cedulaEstudiante: string,
    idCaso: number,
    habilitado: boolean = true
  ): Promise<any> => {
    const query = loadSQL('asignaciones/create-se-le-asigna.sql');
    const result: QueryResult = await pool.query(query, [
      term,
      cedulaEstudiante,
      idCaso,
      habilitado,
    ]);
    return result.rows[0];
  },

  /**
   * Deshabilitar asignación de profesor supervisor
   */
  removeSupervisa: async (
    term: string,
    cedulaProfesor: string,
    idCaso: number
  ): Promise<void> => {
    const query = loadSQL('asignaciones/remove-supervisa.sql');
    await pool.query(query, [term, cedulaProfesor, idCaso]);
  },

  /**
   * Deshabilitar asignación de estudiante
   */
  removeSeLeAsigna: async (
    term: string,
    cedulaEstudiante: string,
    idCaso: number
  ): Promise<void> => {
    const query = loadSQL('asignaciones/remove-se-le-asigna.sql');
    await pool.query(query, [term, cedulaEstudiante, idCaso]);
  },
};

