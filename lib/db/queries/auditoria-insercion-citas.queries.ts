import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaInsercionCitas
 * Todas las queries SQL están en database/queries/auditoria-insercion-citas/
 */
export const auditoriaInsercionCitasQueries = {
  /**
   * Obtiene el conteo total de citas creadas
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-insercion-citas/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todas las citas creadas con filtros opcionales
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
    fecha_creacion: string;
    id_usuario_creo: string;
    nombres_usuario_creo: string | null;
    apellidos_usuario_creo: string | null;
    nombre_completo_usuario_creo: string | null;
    foto_perfil_usuario_creo: string | null;
    usuarios_atendieron?: Array<{
      id_usuario: string;
      nombres: string | null;
      apellidos: string | null;
      nombre_completo: string | null;
      fecha_registro: string;
    }>;
  }>> => {
    const query = loadSQL('auditoria-insercion-citas/get-all.sql');
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
      foto_perfil_usuario_creo: row.foto_perfil_usuario_creo 
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_creo as Buffer).toString('base64')}`
        : null,
      usuarios_atendieron: row.usuarios_atendieron ? (typeof row.usuarios_atendieron === 'string' 
        ? JSON.parse(row.usuarios_atendieron) 
        : row.usuarios_atendieron) : [],
    }));
  },
};
