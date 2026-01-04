import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaInsercionParroquias
 */
export const auditoriaInsercionParroquiasQueries = {
  /**
   * Obtiene el conteo total de parroquias insertados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-insercion-parroquias/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todos los parroquias insertados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    num_parroquia: number;
    nombre_parroquia: string;
    id_estado?: number;
    num_municipio?: number;
    nombre_estado: string | null;
    nombre_municipio: string | null;
    habilitado: boolean | null;
    fecha_creacion: string;
    id_usuario_creo: string;
    nombres_usuario_creo: string | null;
    apellidos_usuario_creo: string | null;
    nombre_completo_usuario_creo: string | null;
    foto_perfil_usuario_creo: string | null;
  }>> => {
    const query = loadSQL('auditoria-insercion-parroquias/get-all.sql');
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
