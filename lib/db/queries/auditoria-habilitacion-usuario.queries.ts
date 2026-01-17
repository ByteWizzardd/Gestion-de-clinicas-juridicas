import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaHabilitacionUsuario
 * Todas las queries SQL están en database/queries/auditoria-habilitacion-usuario/
 */
export const auditoriaHabilitacionUsuarioQueries = {
  /**
   * Obtiene el conteo total de usuarios habilitados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-habilitacion-usuario/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todos los usuarios habilitados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    usuario_habilitado: string;
    nombres_usuario_habilitado: string | null;
    apellidos_usuario_habilitado: string | null;
    nombre_completo_usuario_habilitado: string | null;
    habilitado_por: string;
    nombres_habilitado_por: string | null;
    apellidos_habilitado_por: string | null;
    nombre_completo_habilitado_por: string | null;
    foto_perfil_habilitado_por: string | null;
    motivo: string;
    fecha: string;
  }>> => {
    const query = loadSQL('auditoria-habilitacion-usuario/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc',
    ]);
    
    return result.rows.map(row => ({
      ...row,
      foto_perfil_habilitado_por: row.foto_perfil_habilitado_por 
        ? `data:image/jpeg;base64,${(row.foto_perfil_habilitado_por as Buffer).toString('base64')}`
        : null,
    }));
  },
};
