import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export const parroquiasQueries = {
  getByMunicipio: async (idEstado: number, numMunicipio: number): Promise<Array<{ id_estado: number; num_municipio: number; num_parroquia: number; nombre_parroquia: string }>> => {
    const query = loadSQL('parroquias/get-by-municipio.sql');
    const result: QueryResult = await pool.query(query, [idEstado, numMunicipio]);
    return result.rows;
  },
};

