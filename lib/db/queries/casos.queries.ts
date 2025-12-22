import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Casos
 * Todas las queries SQL están en database/queries/casos/
 */
export const casosQueries = {
  /**
   * Obtiene todos los casos con información del solicitante
   */
  getAll: async (): Promise<any[]> => {
    const query = loadSQL('casos/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Obtiene todos los casos con información del solicitante y profesor responsable (optimizado)
   * Usa un JOIN LATERAL para evitar N+1 queries
   */
  getAllWithProfesor: async (): Promise<any[]> => {
    const query = loadSQL('casos/get-all-with-profesor.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Obtiene un caso por su ID con información completa
   */
  getById: async (id: number): Promise<any | null> => {
    const query = loadSQL('casos/get-by-id.sql');
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Obtiene todos los casos de un solicitante específico
   * @param cedulaSolicitante - Cédula del solicitante
   */
  getBySolicitante: async (cedulaSolicitante: string): Promise<any[]> => {
    const query = loadSQL('casos/get-by-solicitante.sql');
    const result: QueryResult = await pool.query(query, [cedulaSolicitante]);
    return result.rows;
  },

  /**
   * Crea un nuevo caso
   * Si fecha_solicitud no se proporciona, se usa CURRENT_DATE en la base de datos
   * Nota: El estatus se maneja mediante la tabla cambio_estatus, no directamente en casos
   */
  create: async (data: {
    tramite: string;
    observaciones?: string;
    cedula: string;
    id_nucleo: number;
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    num_ambito_legal: number;
    fecha_solicitud?: string | Date;
    fecha_inicio_caso: string | Date;
  }): Promise<any> => {
    const query = loadSQL('casos/create.sql');
    const fechaSolicitudStr = data.fecha_solicitud
      ? (typeof data.fecha_solicitud === 'string' ? data.fecha_solicitud : data.fecha_solicitud.toISOString().split('T')[0])
      : null;
    const fechaInicioStr = typeof data.fecha_inicio_caso === 'string' 
      ? data.fecha_inicio_caso 
      : data.fecha_inicio_caso.toISOString().split('T')[0];
    
    const result: QueryResult = await pool.query(query, [
      data.tramite,
      data.observaciones || null,
      data.cedula,
      data.id_nucleo,
      data.id_materia,
      data.num_categoria,
      data.num_subcategoria,
      data.num_ambito_legal,
      fechaSolicitudStr,
      fechaInicioStr,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene el último ID de caso registrado
   */
  getLastId: async (): Promise<number> => {
    const query = loadSQL('casos/get-last-id.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows[0]?.last_id || 0;
  },

  /**
   * Actualiza un caso existente
   * Nota: El estatus se actualiza mediante la tabla cambio_estatus, no directamente aquí
   */
  update: async (
    id: number,
    data: {
      tramite?: string;
      observaciones?: string;
      fecha_fin_caso?: string;
      id_nucleo?: number;
      id_materia?: number;
      num_categoria?: number;
      num_subcategoria?: number;
      num_ambito_legal?: number;
      fecha_solicitud?: string | Date;
    }
  ): Promise<any> => {
    const query = loadSQL('casos/update.sql');
    const result: QueryResult = await pool.query(query, [
      id,
      data.tramite || null,
      data.observaciones || null,
      data.fecha_fin_caso || null,
      data.id_nucleo || null,
      data.id_materia || null,
      data.num_categoria || null,
      data.num_subcategoria || null,
      data.num_ambito_legal || null,
      data.fecha_solicitud ? (typeof data.fecha_solicitud === 'string' ? data.fecha_solicitud : data.fecha_solicitud.toISOString().split('T')[0]) : null,
    ]);
    return result.rows[0];
  },
};

