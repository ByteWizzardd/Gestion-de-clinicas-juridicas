import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaActualizacionCitas
 * Todas las queries SQL están en database/queries/auditoria-actualizacion-citas/
 */
export const auditoriaActualizacionCitasQueries = {
  /**
   * Obtiene todas las actualizaciones de una cita específica
   */
  getByCita: async (numCita: number, idCaso: number): Promise<Array<{
    id: number;
    num_cita: number;
    id_caso: number;
    // Valores anteriores
    fecha_encuentro_anterior: string | null;
    fecha_proxima_cita_anterior: string | null;
    orientacion_anterior: string | null;
    // Valores nuevos
    fecha_encuentro_nueva: string | null;
    fecha_proxima_cita_nueva: string | null;
    orientacion_nueva: string | null;
    // Información de auditoría
    id_usuario_actualizo: string;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    fecha_actualizacion: string;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-citas/get-by-cita.sql');
    const result: QueryResult = await pool.query(query, [numCita, idCaso]);
    return result.rows;
  },

  /**
   * Obtiene todas las actualizaciones de citas de un caso específico
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    id: number;
    num_cita: number;
    id_caso: number;
    // Valores anteriores
    fecha_encuentro_anterior: string | null;
    fecha_proxima_cita_anterior: string | null;
    orientacion_anterior: string | null;
    // Valores nuevos
    fecha_encuentro_nueva: string | null;
    fecha_proxima_cita_nueva: string | null;
    orientacion_nueva: string | null;
    // Información de auditoría
    id_usuario_actualizo: string;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    fecha_actualizacion: string;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-citas/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    return result.rows;
  },

  /**
   * Obtiene el conteo total de citas actualizadas
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-actualizacion-citas/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todas las citas actualizadas con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
  }): Promise<Array<{
    id: number;
    num_cita: number;
    id_caso: number;
    fecha_encuentro_anterior: string | null;
    fecha_proxima_cita_anterior: string | null;
    orientacion_anterior: string | null;
    fecha_encuentro_nueva: string | null;
    fecha_proxima_cita_nueva: string | null;
    orientacion_nueva: string | null;
    id_usuario_actualizo: string;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    fecha_actualizacion: string;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-citas/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
    ]);
    return result.rows;
  },
};
