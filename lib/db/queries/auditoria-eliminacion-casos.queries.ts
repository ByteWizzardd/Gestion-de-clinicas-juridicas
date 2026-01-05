import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaEliminacionCasos
 * Todas las queries SQL están en database/queries/auditoria-eliminacion-casos/
 */
export const auditoriaEliminacionCasosQueries = {
  /**
   * Obtiene todas las eliminaciones de casos con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    eliminadoPor?: string;
    cedulaSolicitante?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    caso_eliminado: number;
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
    eliminado_por: string | null;
    nombres_usuario_elimino: string | null;
    apellidos_usuario_elimino: string | null;
    nombre_completo_usuario_elimino: string | null;
    motivo: string;
    fecha: string;
  }>> => {
    const query = loadSQL('auditoria-eliminacion-casos/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.eliminadoPor || null,
      filters?.cedulaSolicitante || null,
      filters?.orden || 'desc',
    ]);
    return result.rows;
  },

  /**
   * Obtiene información de un caso eliminado específico
   */
  getByCaso: async (casoEliminado: number): Promise<{
    id: number;
    caso_eliminado: number;
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
    eliminado_por: string | null;
    nombres_usuario_elimino: string | null;
    apellidos_usuario_elimino: string | null;
    nombre_completo_usuario_elimino: string | null;
    motivo: string;
    fecha: string;
  } | null> => {
    const query = loadSQL('auditoria-eliminacion-casos/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [casoEliminado]);
    return result.rows[0] || null;
  },

  /**
   * Obtiene el conteo total de eliminaciones de casos
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-eliminacion-casos/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },
};
