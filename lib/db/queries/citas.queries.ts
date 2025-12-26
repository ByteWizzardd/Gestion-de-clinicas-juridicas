import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export interface CitaCreada {
  num_cita: number;
  id_caso: number;
}

export interface CitaCompleta {
  num_cita: number;
  id_caso: number;
  fecha_encuentro: string;
  fecha_proxima_cita: string | null;
  orientacion: string;
  fecha_registro?: string;
  id_usuario_atencion?: string;
  nombres_usuario_atencion?: string;
  apellidos_usuario_atencion?: string;
  nombre_completo_usuario_atencion?: string;
  tramite: string;
  estatus: string;
  cedula: string;
  nombres_solicitante?: string;
  apellidos_solicitante?: string;
  nombre_completo_solicitante?: string;
  id_nucleo: number;
  nombre_nucleo: string;
  id_materia: number;
  num_categoria: number;
  num_subcategoria: number;
  num_ambito_legal: number;
  nombre_materia?: string;
  nombre_categoria?: string;
  nombre_subcategoria?: string;
}

/**
 * Queries para la entidad Citas
 * Todas las queries SQL están en database/queries/citas/
 */
export const citasQueries = {
  /**
   * Obtiene todas las citas con información relacionada
   * Incluye: caso, solicitante, núcleo, ámbito legal
   */
  getAll: async (): Promise<CitaCompleta[]> => {
    const query = loadSQL('citas/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows as CitaCompleta[];
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

  /**
   * Crea una nueva cita
   */
  create: async (
    caseId: number,
    date: string,
    endDate: string | null,
    orientacion: string
  ): Promise<QueryResult<CitaCreada>> => {
    const query = loadSQL('citas/create.sql');
    return await pool.query(query, [caseId, date, endDate, orientacion]);
  },
};


