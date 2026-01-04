import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaInsercionSubcategorias
 */
export const auditoriaInsercionSubcategoriasQueries = {
  /**
   * Obtiene el conteo total de subcategorias insertados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-insercion-subcategorias/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todos los subcategorias insertados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    num_subcategoria: number;
    nombre_subcategoria: string;
    id_materia?: number;
    num_categoria?: number;
    habilitado: boolean | null;
    fecha_creacion: string;
    id_usuario_creo: string;
    nombres_usuario_creo: string | null;
    apellidos_usuario_creo: string | null;
    nombre_completo_usuario_creo: string | null;
    foto_perfil_usuario_creo: string | null;
  }>> => {
    const query = loadSQL('auditoria-insercion-subcategorias/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc',
    ]);
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_creo: row.foto_perfil_usuario_creo 
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_creo as Buffer).toString('base64')}`
        : null,
    }));
  },
};
