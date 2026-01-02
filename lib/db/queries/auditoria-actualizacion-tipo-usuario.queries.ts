import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaActualizacionTipoUsuario
 * Todas las queries SQL están en database/queries/auditoria-actualizacion-tipo-usuario/
 */
export const auditoriaActualizacionTipoUsuarioQueries = {
  /**
   * Obtiene el conteo total de cambios de tipo de usuario
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-actualizacion-tipo-usuario/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todos los cambios de tipo de usuario con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    ci_usuario: string;
    nombres_usuario: string | null;
    apellidos_usuario: string | null;
    nombre_completo_usuario: string | null;
    tipo_usuario_anterior: string;
    tipo_usuario_nuevo: string;
    actualizado_por: string;
    nombres_actualizado_por: string | null;
    apellidos_actualizado_por: string | null;
    nombre_completo_actualizado_por: string | null;
    fecha: string;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-tipo-usuario/get-all.sql');
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
