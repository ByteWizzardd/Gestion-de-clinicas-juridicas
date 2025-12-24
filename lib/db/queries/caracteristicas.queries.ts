import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export interface Caracteristica {
  id_tipo_caracteristica: number;
  num_caracteristica: number;
  descripcion: string;
  habilitado: boolean;
}

/**
 * Queries para la entidad Caracteristicas
 * Todas las queries SQL están en database/queries/caracteristicas/
 */
export const caracteristicasQueries = {
  /**
   * Obtiene todas las características de un tipo específico
   * @param idTipo - ID del tipo de característica (1=tipo_vivienda, 2=material_piso, etc.)
   */
  getByTipo: async (idTipo: number): Promise<Caracteristica[]> => {
    const query = loadSQL('caracteristicas/get-by-tipo.sql');
    const result: QueryResult = await pool.query(query, [idTipo]);
    return result.rows;
  },
};

