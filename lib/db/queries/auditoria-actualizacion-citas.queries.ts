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
    fecha_encuentro_nuevo: string | null;
    fecha_proxima_cita_nuevo: string | null;
    orientacion_nuevo: string | null;
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
    fecha_encuentro_nuevo: string | null;
    fecha_proxima_cita_nuevo: string | null;
    orientacion_nuevo: string | null;
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
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    num_cita: number;
    id_caso: number;
    fecha_encuentro_anterior: string | null;
    fecha_proxima_cita_anterior: string | null;
    orientacion_anterior: string | null;
    fecha_encuentro_nuevo: string | null;
    fecha_proxima_cita_nuevo: string | null;
    orientacion_nuevo: string | null;
    id_usuario_actualizo: string;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    foto_perfil_usuario_actualizo: string | null;
    fecha_actualizacion: string;
    usuarios_atendieron?: Array<{
      id_usuario: string;
      nombres: string | null;
      apellidos: string | null;
      nombre_completo: string | null;
      fecha_registro: string;
    }>;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-citas/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc', // Por defecto: más reciente primero
    ]);
    // Convertir foto_perfil de Buffer a base64 y parsear usuarios_atendieron
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_actualizo: row.foto_perfil_usuario_actualizo
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_actualizo as Buffer).toString('base64')}`
        : null,
      usuarios_atendieron: row.usuarios_atendieron ? (typeof row.usuarios_atendieron === 'string'
        ? JSON.parse(row.usuarios_atendieron)
        : row.usuarios_atendieron) : [],
    }));
  },
};
