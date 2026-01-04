import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaActualizacionSubcategorias
 */
export const auditoriaActualizacionSubcategoriasQueries = {
  /**
   * Obtiene el conteo total de subcategorias actualizados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-actualizacion-subcategorias/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todas las actualizaciones de subcategorias con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    nombre_subcategoria_anterior: string | null;
    nombre_subcategoria_nuevo: string | null;
    habilitado_anterior: boolean | null;
    habilitado_nuevo: boolean | null;
    fecha_actualizacion: string;
    id_usuario_actualizo: string;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    foto_perfil_usuario_actualizo: string | null;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-subcategorias/get-all.sql');
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
