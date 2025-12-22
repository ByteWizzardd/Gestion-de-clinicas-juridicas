import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Atienden
 * Todas las queries SQL están en database/queries/atienden/
 */
export const atiendenQueries = {
  /**
   * Crea un nuevo registro de atiende
   */
  create: async (data: {
    idUsuario: string;
    numCita: number;
    idCaso: number;
    fechaRegistro?: Date;
  }): Promise<any> => {
    const query = loadSQL('atienden/create.sql');
    const result: QueryResult = await pool.query(query, [
      data.idUsuario,
      data.numCita,
      data.idCaso,
      data.fechaRegistro || null,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene todas las atenciones realizadas para una cita específica
   */
  getByCita: async (numCita: number, idCaso: number): Promise<any[]> => {
    const query = loadSQL('atienden/get-by-cita.sql');
    const result: QueryResult = await pool.query(query, [numCita, idCaso]);
    return result.rows;
  },

  /**
   * Obtiene todas las atenciones realizadas por un usuario específico
   */
  getByUsuario: async (idUsuario: string): Promise<any[]> => {
    const query = loadSQL('atienden/get-by-usuario.sql');
    const result: QueryResult = await pool.query(query, [idUsuario]);
    return result.rows;
  },

  /**
   * Obtiene todas las atenciones realizadas para un caso específico
   */
  getByCaso: async (idCaso: number): Promise<any[]> => {
    const query = loadSQL('atienden/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    return result.rows;
  },
};

