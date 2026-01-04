import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaInsercionCasos
 * Todas las queries SQL están en database/queries/auditoria-insercion-casos/
 */
export const auditoriaInsercionCasosQueries = {
  /**
   * Obtiene todos los casos creados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    cedulaSolicitante?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    id_caso: number | null;
    fecha_solicitud: string | null;
    fecha_inicio_caso: string | null;
    fecha_fin_caso: string | null;
    tramite: string | null;
    observaciones: string | null;
    id_nucleo: number | null;
    nombre_nucleo: string | null;
    cedula_solicitante: string | null;
    nombres_solicitante: string | null;
    apellidos_solicitante: string | null;
    nombre_completo_solicitante: string | null;
    id_materia: number | null;
    nombre_materia: string | null;
    num_categoria: number | null;
    nombre_categoria: string | null;
    num_subcategoria: number | null;
    nombre_subcategoria: string | null;
    num_ambito_legal: number | null;
    ambito_legal: string | null;
    fecha_creacion: string;
    id_usuario_creo: string | null;
    nombres_usuario_creo: string | null;
    apellidos_usuario_creo: string | null;
    nombre_completo_usuario_creo: string | null;
    foto_perfil_usuario_creo: string | null;
  }>> => {
    const query = loadSQL('auditoria-insercion-casos/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.cedulaSolicitante || null,
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
   * Obtiene el conteo total de casos creados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-insercion-casos/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },
};
