import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaActualizacionSolicitantes
 * Todas las queries SQL están en database/queries/auditoria-actualizacion-solicitantes/
 */
export const auditoriaActualizacionSolicitantesQueries = {
  /**
   * Obtiene todas las actualizaciones de solicitantes con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    cedulaSolicitante?: string;
    idUsuario?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    cedula_solicitante: string | null;
    nombres_solicitante: string | null;
    apellidos_solicitante: string | null;
    nombre_completo_solicitante: string | null;
    nombres_anterior: string | null;
    nombres_nuevo: string | null;
    apellidos_anterior: string | null;
    apellidos_nuevo: string | null;
    fecha_nacimiento_anterior: string | null;
    fecha_nacimiento_nuevo: string | null;
    telefono_local_anterior: string | null;
    telefono_local_nuevo: string | null;
    telefono_celular_anterior: string | null;
    telefono_celular_nuevo: string | null;
    correo_electronico_anterior: string | null;
    correo_electronico_nuevo: string | null;
    sexo_anterior: string | null;
    sexo_nuevo: string | null;
    nacionalidad_anterior: string | null;
    nacionalidad_nuevo: string | null;
    estado_civil_anterior: string | null;
    estado_civil_nuevo: string | null;
    concubinato_anterior: boolean | null;
    concubinato_nuevo: boolean | null;
    tipo_tiempo_estudio_anterior: string | null;
    tipo_tiempo_estudio_nuevo: string | null;
    tiempo_estudio_anterior: number | null;
    tiempo_estudio_nuevo: number | null;
    id_nivel_educativo_anterior: number | null;
    id_nivel_educativo_nuevo: number | null;
    id_trabajo_anterior: number | null;
    id_trabajo_nuevo: number | null;
    id_actividad_anterior: number | null;
    id_actividad_nuevo: number | null;
    id_estado_anterior: number | null;
    id_estado_nuevo: number | null;
    num_municipio_anterior: number | null;
    num_municipio_nuevo: number | null;
    num_parroquia_anterior: number | null;
    num_parroquia_nuevo: number | null;
    fecha_actualizacion: string;
    id_usuario_actualizo: string | null;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    foto_perfil_usuario_actualizo: string | null;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-solicitantes/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.cedulaSolicitante || null,
      filters?.idUsuario || null,
      filters?.orden || 'desc',
    ]);
    // Convertir foto_perfil de Buffer a base64
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_actualizo: row.foto_perfil_usuario_actualizo
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_actualizo as Buffer).toString('base64')}`
        : null,
    }));
  },

  /**
   * Obtiene todas las actualizaciones de un solicitante específico
   */
  getBySolicitante: async (cedulaSolicitante: string): Promise<Array<{
    id: number;
    cedula_solicitante: string | null;
    nombres_anterior: string | null;
    nombres_nuevo: string | null;
    apellidos_anterior: string | null;
    apellidos_nuevo: string | null;
    fecha_nacimiento_anterior: string | null;
    fecha_nacimiento_nuevo: string | null;
    telefono_local_anterior: string | null;
    telefono_local_nuevo: string | null;
    telefono_celular_anterior: string | null;
    telefono_celular_nuevo: string | null;
    correo_electronico_anterior: string | null;
    correo_electronico_nuevo: string | null;
    sexo_anterior: string | null;
    sexo_nuevo: string | null;
    nacionalidad_anterior: string | null;
    nacionalidad_nuevo: string | null;
    estado_civil_anterior: string | null;
    estado_civil_nuevo: string | null;
    concubinato_anterior: boolean | null;
    concubinato_nuevo: boolean | null;
    tipo_tiempo_estudio_anterior: string | null;
    tipo_tiempo_estudio_nuevo: string | null;
    tiempo_estudio_anterior: number | null;
    tiempo_estudio_nuevo: number | null;
    id_nivel_educativo_anterior: number | null;
    id_nivel_educativo_nuevo: number | null;
    id_trabajo_anterior: number | null;
    id_trabajo_nuevo: number | null;
    id_actividad_anterior: number | null;
    id_actividad_nuevo: number | null;
    id_estado_anterior: number | null;
    id_estado_nuevo: number | null;
    num_municipio_anterior: number | null;
    num_municipio_nuevo: number | null;
    num_parroquia_anterior: number | null;
    num_parroquia_nuevo: number | null;
    fecha_actualizacion: string;
    id_usuario_actualizo: string | null;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-solicitantes/get-by-solicitante.sql');
    const result: QueryResult = await pool.query(query, [cedulaSolicitante]);
    return result.rows;
  },

  /**
   * Obtiene el conteo total de actualizaciones de solicitantes
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-actualizacion-solicitantes/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },
};
