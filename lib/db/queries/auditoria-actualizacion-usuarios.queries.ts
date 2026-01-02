import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaActualizacionUsuarios
 * Todas las queries SQL están en database/queries/auditoria-actualizacion-usuarios/
 */
export const auditoriaActualizacionUsuariosQueries = {
  /**
   * Obtiene todas las actualizaciones de un usuario específico
   */
  getByUsuario: async (ciUsuario: string): Promise<Array<{
    id: number;
    ci_usuario: string;
    nombres_usuario: string | null;
    apellidos_usuario: string | null;
    nombre_completo_usuario: string | null;
    foto_perfil_usuario: string | null;
    nombres_anterior: string | null;
    apellidos_anterior: string | null;
    correo_electronico_anterior: string | null;
    nombre_usuario_anterior: string | null;
    telefono_celular_anterior: string | null;
    habilitado_sistema_anterior: boolean | null;
    tipo_usuario_anterior: string | null;
    tipo_estudiante_anterior: string | null;
    tipo_profesor_anterior: string | null;
    nombres_nuevo: string | null;
    apellidos_nuevo: string | null;
    correo_electronico_nuevo: string | null;
    nombre_usuario_nuevo: string | null;
    telefono_celular_nuevo: string | null;
    habilitado_sistema_nuevo: boolean | null;
    tipo_usuario_nuevo: string | null;
    tipo_estudiante_nuevo: string | null;
    tipo_profesor_nuevo: string | null;
    id_usuario_actualizo: string;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    foto_perfil_usuario_actualizo: string | null;
    fecha_actualizacion: string;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-usuarios/get-by-usuario.sql');
    const result: QueryResult = await pool.query(query, [ciUsuario]);
    // Convertir foto_perfil de Buffer a base64
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario: row.foto_perfil_usuario 
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario as Buffer).toString('base64')}`
        : null,
      foto_perfil_usuario_actualizo: row.foto_perfil_usuario_actualizo 
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_actualizo as Buffer).toString('base64')}`
        : null,
    }));
  },

  /**
   * Obtiene el conteo total de usuarios actualizados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-actualizacion-usuarios/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0]?.count || '0', 10);
  },

  /**
   * Obtiene todas las actualizaciones de usuarios con filtros opcionales
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
    foto_perfil_usuario: string | null;
    nombres_anterior: string | null;
    apellidos_anterior: string | null;
    correo_electronico_anterior: string | null;
    nombre_usuario_anterior: string | null;
    telefono_celular_anterior: string | null;
    habilitado_sistema_anterior: boolean | null;
    tipo_usuario_anterior: string | null;
    tipo_estudiante_anterior: string | null;
    tipo_profesor_anterior: string | null;
    nombres_nuevo: string | null;
    apellidos_nuevo: string | null;
    correo_electronico_nuevo: string | null;
    nombre_usuario_nuevo: string | null;
    telefono_celular_nuevo: string | null;
    habilitado_sistema_nuevo: boolean | null;
    tipo_usuario_nuevo: string | null;
    tipo_estudiante_nuevo: string | null;
    tipo_profesor_nuevo: string | null;
    id_usuario_actualizo: string;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    foto_perfil_usuario_actualizo: string | null;
    fecha_actualizacion: string;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-usuarios/get-all.sql');
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
      foto_perfil_usuario: row.foto_perfil_usuario 
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario as Buffer).toString('base64')}`
        : null,
      foto_perfil_usuario_actualizo: row.foto_perfil_usuario_actualizo 
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_actualizo as Buffer).toString('base64')}`
        : null,
    }));
  },
};
