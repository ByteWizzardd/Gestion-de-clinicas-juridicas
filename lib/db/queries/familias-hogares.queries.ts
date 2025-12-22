import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Familias Hogares
 * Todas las queries SQL están en database/queries/familias-hogares/
 */
export const familiasHogaresQueries = {
  /**
   * Crea un nuevo hogar familiar
   */
  create: async (data: {
    cantPersonas: number;
    cantTrabajadores: number;
    cantNinos: number;
    cantNinosEstudiando: number;
    jefeHogar: boolean;
    idNivelEducativo?: number | null;
    ingresosMensuales: number;
  }): Promise<any> => {
    const query = loadSQL('familias-hogares/create.sql');
    const result: QueryResult = await pool.query(query, [
      data.cantPersonas,
      data.cantTrabajadores,
      data.cantNinos,
      data.cantNinosEstudiando,
      data.jefeHogar,
      data.idNivelEducativo || null,
      data.ingresosMensuales,
    ]);
    return result.rows[0];
  },
};

