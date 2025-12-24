import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';
import { DatabaseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

/**
 * Queries para autenticación
 * Nota: Las queries de usuarios están en database/queries/usuarios/
 */
export const authQueries = {
  /**
   * Obtiene un usuario por su nombre_usuario
   */
  getUserByNombreUsuario: async (nombreUsuario: string): Promise<any | null> => {
    try {
      const query = loadSQL('usuarios/get-by-nombre-usuario.sql');
      const result: QueryResult = await pool.query(query, [nombreUsuario]);
      return result.rows[0] || null;
    } catch (error: any) {
      // Detectar si el error es porque falta la columna password_hash o nombre_usuario
      if (error?.code === '42703') {
        if (error?.message?.includes('password_hash')) {
          logger.error('La columna password_hash no existe. Ejecuta la migración primero.');
          throw new DatabaseError(
            'La columna password_hash no existe en la tabla usuarios. Por favor ejecuta la migración: database/migrations/add-password-to-usuarios.sql o visita /api/auth/migrate',
            error
          );
        }
        if (error?.message?.includes('nombre_usuario')) {
          logger.error('La columna nombre_usuario no existe. Ejecuta la migración primero.');
          throw new DatabaseError(
            'La columna nombre_usuario no existe en la tabla usuarios. Por favor ejecuta la migración: database/migrations/add-nombre-usuario-to-usuarios.sql',
            error
          );
        }
      }
      logger.error('Error en getUserByNombreUsuario', error);
      throw new DatabaseError(
        'Error al buscar usuario por nombre_usuario',
        error
      );
    }
  },

  /**
   * Obtiene un usuario por su correo electrónico (mantenido para compatibilidad)
   */
  getUserByEmail: async (email: string): Promise<any | null> => {
    try {
      const query = loadSQL('usuarios/get-by-email.sql');
      const result: QueryResult = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error: any) {
      // Detectar si el error es porque falta la columna password_hash
      if (error?.code === '42703' && error?.message?.includes('password_hash')) {
        logger.error('La columna password_hash no existe. Ejecuta la migración primero.');
        throw new DatabaseError(
          'La columna password_hash no existe en la tabla usuarios. Por favor ejecuta la migración: database/migrations/add-password-to-usuarios.sql o visita /api/auth/migrate',
          error
        );
      }
      logger.error('Error en getUserByEmail', error);
      throw new DatabaseError(
        'Error al buscar usuario por correo',
        error
      );
    }
  },

  /**
   * Obtiene un usuario por su cédula
   */
  getUserByCedula: async (cedula: string): Promise<any | null> => {
    try {
      const query = loadSQL('usuarios/get-by-cedula.sql');
      const result: QueryResult = await pool.query(query, [cedula]);
      return result.rows[0] || null;
    } catch (error: any) {
      // Detectar si el error es porque falta la columna password_hash
      if (error?.code === '42703' && error?.message?.includes('password_hash')) {
        logger.error('La columna password_hash no existe. Ejecuta la migración primero.');
        throw new DatabaseError(
          'La columna password_hash no existe en la tabla usuarios. Por favor ejecuta la migración: database/migrations/add-password-to-usuarios.sql o visita /api/auth/migrate',
          error
        );
      }
      logger.error('Error en getUserByCedula', error);
      throw new DatabaseError(
        'Error al buscar usuario por cédula',
        error
      );
    }
  },
};