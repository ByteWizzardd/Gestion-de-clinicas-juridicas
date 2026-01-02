import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export const municipiosQueries = {
  getByEstado: async (idEstado: number): Promise<Array<{ id_estado: number; num_municipio: number; nombre_municipio: string }>> => {
    const query = loadSQL('municipios/get-by-estado.sql');
    const result: QueryResult = await pool.query(query, [idEstado]);
    return result.rows;
  },
};

