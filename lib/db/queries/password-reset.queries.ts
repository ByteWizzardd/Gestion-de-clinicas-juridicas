import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para tokens de recuperación de contraseña
 * Todas las queries SQL están en database/queries/password-reset/
 */
export const passwordResetQueries = {
  /**
   * Crea un nuevo token de recuperación de contraseña
   */
  createToken: async (data: {
    cedula_usuario: string;
    codigo_verificacion: string;
    fecha_expiracion: Date;
  }): Promise<any> => {
    const query = loadSQL('password-reset/create-token.sql');
    const fechaExpiracionStr = data.fecha_expiracion.toISOString().split('T')[0];
    const result: QueryResult = await pool.query(query, [
      data.cedula_usuario,
      data.codigo_verificacion,
      fechaExpiracionStr,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene un token por código de verificación con información del usuario
   */
  getByCode: async (codigo: string): Promise<{
    id_token: number;
    cedula_usuario: string;
    codigo_verificacion: string;
    fecha_expiracion: Date;
    usado: boolean;
    fecha_creacion: Date;
    correo_electronico: string;
    nombres: string;
    apellidos: string;
  } | null> => {
    const query = loadSQL('password-reset/get-by-code.sql');
    const result: QueryResult = await pool.query(query, [codigo]);
    return result.rows[0] || null;
  },

  /**
   * Marca un token como usado
   */
  markAsUsed: async (idToken: number): Promise<any> => {
    const query = loadSQL('password-reset/mark-as-used.sql');
    const result: QueryResult = await pool.query(query, [idToken]);
    return result.rows[0];
  },

  /**
   * Limpia tokens expirados o usados (para mantenimiento)
   */
  cleanupExpired: async (): Promise<void> => {
    const query = loadSQL('password-reset/cleanup-expired.sql');
    await pool.query(query);
  },
};

