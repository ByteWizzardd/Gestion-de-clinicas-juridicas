import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaInsercionSoportes
 * Todas las queries SQL están en database/queries/auditoria-insercion-soportes/
 */
export const auditoriaInsercionSoportesQueries = {
  /**
   * Obtiene todos los soportes creados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    num_soporte: number;
    id_caso: number;
    nombre_archivo: string;
    tipo_mime: string;
    descripcion: string | null;
    fecha_consignacion: string;

    fecha_creacion: string;
    id_usuario_subio: string | null;
    nombres_usuario_subio: string | null;
    apellidos_usuario_subio: string | null;
    nombre_completo_usuario_subio: string | null;
    foto_perfil_usuario_subio: string | null;
  }>> => {
    const query = loadSQL('auditoria-insercion-soportes/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc', // Por defecto: más reciente primero
    ]);
    // Convertir foto_perfil de Buffer a base64
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_subio: row.foto_perfil_usuario_subio
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_subio as Buffer).toString('base64')}`
        : null,
    }));
  },

  /**
   * Obtiene el conteo total de soportes creados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-insercion-soportes/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todos los soportes creados para un caso específico
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    id: number;
    num_soporte: number;
    id_caso: number;
    nombre_archivo: string;
    tipo_mime: string;
    descripcion: string | null;
    fecha_consignacion: string;

    fecha_creacion: string;
    id_usuario_subio: string | null;
    nombres_usuario_subio: string | null;
    apellidos_usuario_subio: string | null;
    nombre_completo_usuario_subio: string | null;
    foto_perfil_usuario_subio: string | null;
  }>> => {
    const query = loadSQL('auditoria-insercion-soportes/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    // Convertir foto_perfil de Buffer a base64
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_subio: row.foto_perfil_usuario_subio
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_subio as Buffer).toString('base64')}`
        : null,
    }));
  },
};
