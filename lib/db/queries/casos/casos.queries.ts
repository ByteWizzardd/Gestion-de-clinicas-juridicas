import { loadSQL } from '../../sql-loader';
import { pool } from '../../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Casos
 * Todas las queries SQL están en database/queries/casos/
 */
export const casosQueries = {
  /**
   * Obtiene todos los casos con información del cliente
   */
  getAll: async (): Promise<any[]> => {
    const query = loadSQL('casos/get-all.sql');
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
   * Obtiene todos los casos de un cliente específico
   */
  getByCliente: async (cedulaCliente: string): Promise<any[]> => {
    const query = loadSQL('casos/get-by-cliente.sql');
    const result: QueryResult = await pool.query(query, [cedulaCliente]);
    return result.rows;
  },

  /**
   * Crea un nuevo caso
   * Si fecha_solicitud no se proporciona, se usa CURRENT_DATE en la base de datos
   */
  create: async (data: {
    tramite: string;
    estatus: string;
    observaciones?: string;
    cedula_cliente: string;
    id_nucleo?: number;
    id_ambito_legal?: number;
    id_expediente?: string;
    fecha_solicitud?: string | Date;
  }): Promise<any> => {
    const query = loadSQL('casos/create.sql');
    const fechaSolicitudStr = data.fecha_solicitud
      ? (typeof data.fecha_solicitud === 'string' ? data.fecha_solicitud : data.fecha_solicitud.toISOString().split('T')[0])
      : null;
    
    const result: QueryResult = await pool.query(query, [
      data.tramite,
      data.estatus,
      data.observaciones || null,
      data.cedula_cliente,
      data.id_nucleo || null,
      data.id_ambito_legal || null,
      data.id_expediente || null,
      fechaSolicitudStr,
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
   */
  update: async (
    id: number,
    data: {
      tramite?: string;
      estatus?: string;
      observaciones?: string;
      fecha_fin_caso?: string;
      id_nucleo?: number;
      id_ambito_legal?: number;
      id_expediente?: string;
      fecha_solicitud?: string | Date;
    }
  ): Promise<any> => {
    const query = loadSQL('casos/update.sql');
    const result: QueryResult = await pool.query(query, [
      id,
      data.tramite || null,
      data.estatus || null,
      data.observaciones || null,
      data.fecha_fin_caso || null,
      data.id_nucleo || null,
      data.id_ambito_legal || null,
      data.id_expediente || null,
      data.fecha_solicitud ? (typeof data.fecha_solicitud === 'string' ? data.fecha_solicitud : data.fecha_solicitud.toISOString().split('T')[0]) : null,
    ]);
    return result.rows[0];
  },
};

