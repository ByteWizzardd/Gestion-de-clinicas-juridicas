import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaInsercionUsuarios
 * Todas las queries SQL están en database/queries/auditoria-insercion-usuarios/
 */
export const auditoriaInsercionUsuariosQueries = {
  /**
   * Obtiene todos los usuarios creados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    nombre_usuario: string;
    telefono_celular: string | null;
    habilitado_sistema: boolean;
    tipo_usuario: string;
    tipo_estudiante: string | null;
    term: string | null;
    tipo_profesor: string | null;
    fecha_creacion: string;
    id_usuario_creo: string;
    nombres_usuario_creo: string | null;
    apellidos_usuario_creo: string | null;
    nombre_completo_usuario_creo: string | null;
    foto_perfil_usuario_creo: string | null;
  }>> => {
    const query = loadSQL('auditoria-insercion-usuarios/get-all.sql');
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
      foto_perfil_usuario_creo: row.foto_perfil_usuario_creo
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_creo as Buffer).toString('base64')}`
        : null,
    }));
  },

  /**
   * Obtiene el conteo total de usuarios creados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-insercion-usuarios/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  getCombined: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }) => {
    const query = loadSQL('auditoria-insercion-usuarios/get-combined.sql');
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
