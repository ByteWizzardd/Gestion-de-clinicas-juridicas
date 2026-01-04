import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaActualizacionEstados
 */
export const auditoriaActualizacionEstadosQueries = {
  /**
   * Obtiene el conteo total de estados actualizados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-actualizacion-estados/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todas las actualizaciones de estados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    id_estado: number;
    nombre_estado_anterior: string | null;
    nombre_estado_nuevo: string | null;
    habilitado_anterior: boolean | null;
    habilitado_nuevo: boolean | null;
    fecha_actualizacion: string;
    id_usuario_actualizo: string;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    foto_perfil_usuario_actualizo: string | null;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-estados/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc',
    ]);
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_actualizo: row.foto_perfil_usuario_actualizo 
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_actualizo as Buffer).toString('base64')}`
        : null,
    }));
  },
};
