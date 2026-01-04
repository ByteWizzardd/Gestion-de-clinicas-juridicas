import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaInsercionSolicitantes
 * Todas las queries SQL están en database/queries/auditoria-insercion-solicitantes/
 */
export const auditoriaInsercionSolicitantesQueries = {
  /**
   * Obtiene todos los solicitantes creados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    cedula: string | null;
    nombres: string | null;
    apellidos: string | null;
    fecha_nacimiento: string | null;
    telefono_local: string | null;
    telefono_celular: string | null;
    correo_electronico: string | null;
    sexo: string | null;
    nacionalidad: string | null;
    estado_civil: string | null;
    concubinato: boolean | null;
    tipo_tiempo_estudio: string | null;
    tiempo_estudio: number | null;
    id_nivel_educativo: number | null;
    nivel_educativo: string | null;
    id_trabajo: number | null;
    condicion_trabajo: string | null;
    id_actividad: number | null;
    condicion_actividad: string | null;
    id_estado: number | null;
    nombre_estado: string | null;
    num_municipio: number | null;
    nombre_municipio: string | null;
    num_parroquia: number | null;
    nombre_parroquia: string | null;
    fecha_creacion: string;
    id_usuario_creo: string | null;
    nombres_usuario_creo: string | null;
    apellidos_usuario_creo: string | null;
    nombre_completo_usuario_creo: string | null;
    foto_perfil_usuario_creo: string | null;
  }>> => {
    const query = loadSQL('auditoria-insercion-solicitantes/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc',
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
   * Obtiene el conteo total de solicitantes creados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-insercion-solicitantes/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },
};
