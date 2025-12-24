import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Acciones
 * Todas las queries SQL están en database/queries/acciones/
 */
export const accionesQueries = {
  /**
   * Obtiene todas las acciones realizadas para un caso específico
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    id_usuario_registra: string;
    fecha_registro: string;
    nombres_usuario_registra: string;
    apellidos_usuario_registra: string;
    nombre_completo_usuario_registra: string;
    ejecutores: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_ejecucion: string;
    }>;
  }>> => {
    const query = loadSQL('acciones/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    // Parsear el JSON de ejecutores
    return result.rows.map(row => ({
      ...row,
      ejecutores: typeof row.ejecutores === 'string' 
        ? JSON.parse(row.ejecutores) 
        : row.ejecutores || []
    }));
  },
};

