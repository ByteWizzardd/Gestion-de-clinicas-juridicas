import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaEliminacionCaracteristicas
 */
export const auditoriaEliminacionCaracteristicasQueries = {
  /**
   * Obtiene el conteo total de caracteristicas eliminados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-eliminacion-caracteristicas/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todos los caracteristicas eliminados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    id_tipo_caracteristica: number;
    num_caracteristica: number;
    descripcion: string;
    habilitado: boolean | null;
    fecha_eliminacion: string;
    id_usuario_elimino: string;
    nombres_usuario_elimino: string | null;
    apellidos_usuario_elimino: string | null;
    nombre_completo_usuario_elimino: string | null;
    foto_perfil_usuario_elimino: string | null;
    motivo: string | null;
  }>> => {
    const query = loadSQL('auditoria-eliminacion-caracteristicas/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc',
    ]);
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_elimino: row.foto_perfil_usuario_elimino
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_elimino as Buffer).toString('base64')}`
        : null,
    }));
  },
};
