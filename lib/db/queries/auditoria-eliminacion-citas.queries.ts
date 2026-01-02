import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaEliminacionCitas
 * Todas las queries SQL están en database/queries/auditoria-eliminacion-citas/
 */
export const auditoriaEliminacionCitasQueries = {
  /**
   * Obtiene todas las citas eliminadas de un caso específico
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    id: number;
    num_cita: number;
    id_caso: number;
    fecha_encuentro: string;
    fecha_proxima_cita: string | null;
    orientacion: string;
    fecha_eliminacion: string;
    // Información de auditoría: usuario que registró la cita
    id_usuario_registro: string | null;
    nombres_usuario_registro: string | null;
    apellidos_usuario_registro: string | null;
    nombre_completo_usuario_registro: string | null;
    // Información de auditoría: usuario que eliminó
    id_usuario_elimino: string;
    nombres_usuario_elimino: string | null;
    apellidos_usuario_elimino: string | null;
    nombre_completo_usuario_elimino: string | null;
    // Motivo de la eliminación
    motivo: string | null;
  }>> => {
    const query = loadSQL('auditoria-eliminacion-citas/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    return result.rows;
  },

  /**
   * Obtiene información de una cita eliminada específica
   */
  getCita: async (numCita: number, idCaso: number): Promise<{
    id: number;
    num_cita: number;
    id_caso: number;
    fecha_encuentro: string;
    fecha_proxima_cita: string | null;
    orientacion: string;
    fecha_eliminacion: string;
    // Información de auditoría: usuario que registró la cita
    id_usuario_registro: string | null;
    nombres_usuario_registro: string | null;
    apellidos_usuario_registro: string | null;
    nombre_completo_usuario_registro: string | null;
    // Información de auditoría: usuario que eliminó
    id_usuario_elimino: string;
    nombres_usuario_elimino: string | null;
    apellidos_usuario_elimino: string | null;
    nombre_completo_usuario_elimino: string | null;
    motivo: string | null;
  } | null> => {
    const query = loadSQL('auditoria-eliminacion-citas/get-cita.sql');
    const result: QueryResult = await pool.query(query, [numCita, idCaso]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  },

  /**
   * Obtiene el conteo total de citas eliminadas
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-eliminacion-citas/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todas las citas eliminadas con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    num_cita: number;
    id_caso: number;
    fecha_encuentro: string;
    fecha_proxima_cita: string | null;
    orientacion: string;
    fecha_eliminacion: string;
    id_usuario_registro: string | null;
    nombres_usuario_registro: string | null;
    apellidos_usuario_registro: string | null;
    nombre_completo_usuario_registro: string | null;
    id_usuario_elimino: string;
    nombres_usuario_elimino: string | null;
    apellidos_usuario_elimino: string | null;
    nombre_completo_usuario_elimino: string | null;
    motivo: string | null;
  }>> => {
    const query = loadSQL('auditoria-eliminacion-citas/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc', // Por defecto: más reciente primero
    ]);
    return result.rows;
  },
};
