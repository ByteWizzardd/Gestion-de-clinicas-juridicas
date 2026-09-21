import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para tokens de recuperación de contraseña
 * Todas las queries SQL están en database/queries/password-reset/
 */

export interface TokenRecuperacion {
  id_token: number;
  cedula_usuario: string;
  codigo_verificacion: string;
  fecha_expiracion: Date;
  usado: boolean;
  intentos: number;
  fecha_creacion: Date;
  correo_electronico: string;
  nombres: string;
  apellidos: string;
}

export const passwordResetQueries = {
  /**
   * Crea un nuevo token de recuperación de contraseña.
   *
   * La expiración se pasa como timestamp completo: la columna dejó de ser DATE
   * en la migración 20260919_120000, porque truncar a día hacía imposible una
   * caducidad corta.
   */
  createToken: async (data: {
    cedula_usuario: string;
    codigo_verificacion: string;
    fecha_expiracion: Date;
  }): Promise<TokenRecuperacion> => {
    const query = loadSQL('password-reset/create-token.sql');
    const result: QueryResult = await pool.query(query, [
      data.cedula_usuario,
      data.codigo_verificacion,
      data.fecha_expiracion,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene el token vigente de un usuario.
   *
   * Deliberadamente NO existe una búsqueda por código suelto: la anterior
   * permitía que un código acertado al azar sirviera para cualquier cuenta.
   */
  getActiveByCedula: async (cedula: string): Promise<TokenRecuperacion | null> => {
    const query = loadSQL('password-reset/get-active-by-cedula.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows[0] || null;
  },

  /**
   * Suma un intento fallido y devuelve el total acumulado del token.
   */
  incrementAttempts: async (idToken: number): Promise<number> => {
    const query = loadSQL('password-reset/increment-attempts.sql');
    const result: QueryResult = await pool.query(query, [idToken]);
    return result.rows[0]?.intentos ?? 0;
  },

  /**
   * Marca el token como usado, pero solo si seguía vigente y sin usar.
   *
   * @returns true si este llamado fue el que lo consumió
   */
  consumeToken: async (idToken: number, cedula: string): Promise<boolean> => {
    const query = loadSQL('password-reset/consume-token.sql');
    const result: QueryResult = await pool.query(query, [idToken, cedula]);
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Invalida los códigos anteriores del usuario antes de emitirle uno nuevo.
   */
  invalidateUserTokens: async (cedula: string): Promise<void> => {
    const query = loadSQL('password-reset/invalidate-user-tokens.sql');
    await pool.query(query, [cedula]);
  },

  /**
   * Limpia tokens expirados o usados (para mantenimiento)
   */
  cleanupExpired: async (): Promise<void> => {
    const query = loadSQL('password-reset/cleanup-expired.sql');
    await pool.query(query);
  },
};
