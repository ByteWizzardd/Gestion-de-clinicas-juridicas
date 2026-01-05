import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaActualizacionParroquias
 */
export const auditoriaActualizacionParroquiasQueries = {
  /**
   * Obtiene el conteo total de parroquias actualizados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-actualizacion-parroquias/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todas las actualizaciones de parroquias con filtros opcionales
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
    num_municipio: number;
    num_parroquia: number;
    nombre_parroquia_anterior: string | null;
    nombre_parroquia_nuevo: string | null;
    habilitado_anterior: boolean | null;
    habilitado_nuevo: boolean | null;
    id_estado_anterior: number | null;
    id_estado_nuevo: number | null;
    num_municipio_anterior: number | null;
    num_municipio_nuevo: number | null;
    nombre_estado_anterior: string | null;
    nombre_estado_nuevo: string | null;
    nombre_municipio_anterior: string | null;
    nombre_municipio_nuevo: string | null;
    fecha_actualizacion: string;
    id_usuario_actualizo: string;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    foto_perfil_usuario_actualizo: string | null;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-parroquias/get-all.sql');
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
