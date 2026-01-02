import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaEliminacionUsuario
 * Todas las queries SQL están en database/queries/auditoria-eliminacion-usuario/
 */
export const auditoriaEliminacionUsuarioQueries = {
  /**
   * Obtiene el conteo total de usuarios eliminados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-eliminacion-usuario/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todos los usuarios eliminados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    usuario_eliminado: string;
    nombres_usuario_eliminado: string | null;
    apellidos_usuario_eliminado: string | null;
    nombre_completo_usuario_eliminado: string | null;
    eliminado_por: string;
    motivo: string;
    fecha: string;
  }>> => {
    const query = loadSQL('auditoria-eliminacion-usuario/get-all.sql');
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
