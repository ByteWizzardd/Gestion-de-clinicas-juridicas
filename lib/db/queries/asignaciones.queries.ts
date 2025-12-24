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
};

