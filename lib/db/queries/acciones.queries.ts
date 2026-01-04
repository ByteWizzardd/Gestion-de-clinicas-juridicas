import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Acciones
 * Todas las queries SQL están en database/queries/acciones/
 */
export const accionesQueries = {
  /**
   * Crea una nueva acción para un caso
   */
  create: async (
    idCaso: number,
    detalleAccion: string,
    idUsuarioRegistra: string,
    comentario?: string,
    numAccion?: number
  ): Promise<any> => {
    const query = loadSQL('acciones/create.sql');
    const result: QueryResult = await pool.query(query, [
      idCaso,
      detalleAccion,
      comentario || null,
      idUsuarioRegistra,
      numAccion || null,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene todas las acciones realizadas para un caso específico
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    id_usuario_registra: string;
    fecha_registro: string;
    nombres_usuario_registra: string;
    apellidos_usuario_registra: string;
    nombre_completo_usuario_registra: string;
    ejecutores: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_ejecucion: string;
    }>;
  }>> => {
    const query = loadSQL('acciones/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    // Parsear el JSON de ejecutores
    return result.rows.map(row => ({
      ...row,
      ejecutores: typeof row.ejecutores === 'string'
        ? JSON.parse(row.ejecutores)
        : row.ejecutores || []
    }));
  },

  /**
   * Busca una acción relacionada con una cita específica
   */
  findByCita: async (
    idCaso: number,
    fechaCita: string,
    orientacion: string
  ): Promise<{
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    id_usuario_registra: string;
    fecha_registro: string;
  } | null> => {
    const query = loadSQL('acciones/find-by-cita.sql');
    const result: QueryResult = await pool.query(query, [idCaso, fechaCita, orientacion]);
    return result.rows[0] || null;
  },

  /**
   * Elimina una acción específica
   */
  delete: async (numAccion: number, idCaso: number): Promise<void> => {
    const query = loadSQL('acciones/delete.sql');
    await pool.query(query, [numAccion, idCaso]);
  },

  /**
   * Actualiza una acción específica
   */
  update: async (
    numAccion: number,
    idCaso: number,
    detalleAccion: string,
    comentario?: string | null
  ): Promise<void> => {
    const query = loadSQL('acciones/update.sql');
    await pool.query(query, [numAccion, idCaso, detalleAccion, comentario]);
  },

  /**
   * Obtiene las acciones más recientes de los casos asignados al usuario
   */
  getRecentByUsuario: async (
    cedulaUsuario: string,
    limite: number = 10
  ): Promise<Array<{
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    id_usuario_registra: string;
    fecha_registro: string;
    nombres_usuario_registra: string;
    apellidos_usuario_registra: string;
    nombre_completo_usuario_registra: string;
    caso_id: number;
    nombre_solicitante: string;
    nombre_nucleo: string;
    ejecutores: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_ejecucion: string;
    }>;
  }>> => {
    const query = loadSQL('acciones/get-recent-by-usuario.sql');
    const result: QueryResult = await pool.query(query, [cedulaUsuario, limite]);
    // Parsear el JSON de ejecutores
    return result.rows.map(row => ({
      ...row,
      ejecutores: typeof row.ejecutores === 'string'
        ? JSON.parse(row.ejecutores)
        : row.ejecutores || []
    }));
  },
};