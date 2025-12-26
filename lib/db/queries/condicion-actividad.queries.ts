import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export interface CondicionActividad {
  id_actividad: number;
  nombre_actividad: string;
}

/**
 * Queries para la entidad CondicionActividad
 * Todas las queries SQL están en database/queries/condicion-actividad/
 */
export const condicionActividadQueries = {
  /**
   * Obtiene todas las condiciones de actividad
   */
  getAll: async (): Promise<CondicionActividad[]> => {
    const query = loadSQL('condicion-actividad/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },
};

