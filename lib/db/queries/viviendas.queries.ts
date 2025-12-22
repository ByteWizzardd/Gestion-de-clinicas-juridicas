import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Viviendas
 * Todas las queries SQL están en database/queries/viviendas/
 */
export const viviendasQueries = {
  /**
   * Crea una nueva vivienda
   */
  create: async (data: {
    tipoVivienda: string;
    cantHabitaciones: number;
    cantBanos: number;
    materialPiso: string;
    materialParedes: string;
    materialTecho: string;
    aguaPotable: string;
    eliminacionAguasN: string;
    aseo: string;
  }): Promise<any> => {
    const query = loadSQL('viviendas/create.sql');
    const result: QueryResult = await pool.query(query, [
      data.tipoVivienda,
      data.cantHabitaciones,
      data.cantBanos,
      data.materialPiso,
      data.materialParedes,
      data.materialTecho,
      data.aguaPotable,
      data.eliminacionAguasN,
      data.aseo,
    ]);
    return result.rows[0];
  },
};

