import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaEliminacionSoportes
 * Todas las queries SQL están en database/queries/auditoria-eliminacion-soportes/
 */
export const auditoriaEliminacionSoportesQueries = {
  /**
   * Obtiene todos los soportes eliminados de un caso específico
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    id: number;
    num_soporte: number;
    id_caso: number;
    nombre_archivo: string;
    tipo_mime: string;
    descripcion: string | null;
    fecha_consignacion: string;
    fecha_eliminacion: string;
    tamano_bytes: number;
    // Información de auditoría: usuario que subió
    id_usuario_subio: string | null;
    nombres_usuario_subio: string | null;
    apellidos_usuario_subio: string | null;
    nombre_completo_usuario_subio: string | null;
    // Información de auditoría: usuario que eliminó
    id_usuario_elimino: string;
    nombres_usuario_elimino: string | null;
    apellidos_usuario_elimino: string | null;
    nombre_completo_usuario_elimino: string | null;
    // Motivo de la eliminación
    motivo: string | null;
  }>> => {
    const query = loadSQL('auditoria-eliminacion-soportes/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    return result.rows;
  },

  /**
   * Obtiene información de un soporte eliminado específico
   * Nota: Los documentos eliminados no se guardan, solo sus metadatos
   */
  getDocumento: async (idCaso: number, numSoporte: number): Promise<{
    nombre_archivo: string;
    tipo_mime: string;
    tamano_bytes: number;
    motivo: string | null;
    fecha_eliminacion: string;
  } | null> => {
    const query = loadSQL('auditoria-eliminacion-soportes/get-documento.sql');
    const result: QueryResult = await pool.query(query, [idCaso, numSoporte]);
    if (result.rows.length === 0) {
      return null;
    }
    return {
      nombre_archivo: result.rows[0].nombre_archivo,
      tipo_mime: result.rows[0].tipo_mime,
      tamano_bytes: result.rows[0].tamano_bytes,
      motivo: result.rows[0].motivo,
      fecha_eliminacion: result.rows[0].fecha_eliminacion,
    };
  },

  /**
   * Obtiene el conteo total de soportes eliminados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-eliminacion-soportes/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todos los soportes eliminados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    num_soporte: number;
    id_caso: number;
    nombre_archivo: string;
    tipo_mime: string | null;
    descripcion: string | null;
    fecha_consignacion: string | null;
    fecha_eliminacion: string;
    tamano_bytes: number | null;
    id_usuario_subio: string | null;
    nombres_usuario_subio: string | null;
    apellidos_usuario_subio: string | null;
    nombre_completo_usuario_subio: string | null;
    id_usuario_elimino: string;
    nombres_usuario_elimino: string | null;
    apellidos_usuario_elimino: string | null;
    nombre_completo_usuario_elimino: string | null;
    foto_perfil_usuario_elimino: string | null;
    motivo: string | null;
  }>> => {
    const query = loadSQL('auditoria-eliminacion-soportes/get-all.sql');
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
      foto_perfil_usuario_elimino: row.foto_perfil_usuario_elimino 
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_elimino as Buffer).toString('base64')}`
        : null,
    }));
  },
};
