import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export const estadosQueries = {
  getAll: async (): Promise<Array<{ id_estado: number; nombre_estado: string }>> => {
    const query = loadSQL('estados/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },
};

