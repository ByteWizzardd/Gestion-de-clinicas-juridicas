import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Citas
 * Todas las queries SQL están en database/queries/citas/
 */
export const citasQueries = {
  /**
   * Obtiene todas las citas con información relacionada
   * Incluye: caso, solicitante, núcleo, ámbito legal
   */
  getAll: async (): Promise<any[]> => {
    const query = loadSQL('citas/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Obtiene todas las citas de un caso específico con información de atenciones
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    num_cita: number;
    id_caso: number;
    fecha_encuentro: string;
    fecha_proxima_cita: string | null;
    orientacion: string;
    atenciones: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_registro: string;
    }>;
  }>> => {
    const query = loadSQL('citas/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    // Parsear el JSON de atenciones
    return result.rows.map(row => ({
      ...row,
      atenciones: typeof row.atenciones === 'string' 
        ? JSON.parse(row.atenciones) 
        : row.atenciones || []
    }));
  },
};

