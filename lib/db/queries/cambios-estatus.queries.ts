import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Cambios de Estatus
 * Todas las queries SQL están en database/queries/cambios-estatus/
 */
export const cambiosEstatusQueries = {
  /**
   * Registra un cambio de estatus para un caso
   * @param cedulaUsuario Cédula del usuario/estudiante que registra el cambio
   * @param idCaso ID del caso
   * @param estatusNuevo Nuevo estatus del caso
   */
  create: async (
    cedulaUsuario: string,
    idCaso: number,
    estatusNuevo: string
  ): Promise<any> => {
    const query = loadSQL('cambios-estatus/create.sql');
    const result: QueryResult = await pool.query(query, [
      cedulaUsuario,
      idCaso,
      estatusNuevo,
    ]);
    return result.rows[0];
  },
};

