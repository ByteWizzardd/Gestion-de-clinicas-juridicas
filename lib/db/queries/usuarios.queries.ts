import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Usuarios
 * Todas las queries SQL están en database/queries/usuarios/
 */
export const usuariosQueries = {
  /**
   * Busca usuarios por cédula (búsqueda parcial)
   * Busca en la tabla usuarios (estudiantes, profesores, coordinadores)
   */
  searchByCedula: async (cedula: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('usuarios/search-by-cedula.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },

  /**
   * Busca usuarios por cédula excluyendo solicitantes (para recomendaciones)
   */
  searchByCedulaExcludeSolicitantes: async (cedula: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    telefono_celular: string;
    correo_electronico: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('usuarios/search-by-cedula-exclude-solicitantes.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },

  /**
   * Busca usuarios por correo electrónico (búsqueda exacta)
   */
  searchByEmail: async (email: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('usuarios/search-by-email.sql');
    const result: QueryResult = await pool.query(query, [email]);
    return result.rows;
  },

  /**
   * Obtiene un usuario completo por cédula con todos los campos necesarios para autocompletar
   */
  getCompleteByCedula: async (cedula: string): Promise<{
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    telefono_celular: string | null;
    nombre_completo: string;
  } | null> => {
    const query = loadSQL('usuarios/get-complete-by-cedula.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows[0] || null;
  },

  /**
   * Crea o actualiza un usuario
   */
  createOrUpdate: async (data: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    nombre_usuario: string;
    contrasena: string;
    telefono_celular?: string | null;
  }): Promise<any> => {
    const query = loadSQL('usuarios/create-or-update.sql');
    const result: QueryResult = await pool.query(query, [
      data.cedula,
      data.nombres,
      data.apellidos,
      data.correo_electronico,
      data.nombre_usuario,
      data.contrasena,
      data.telefono_celular || null,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene todos los usuarios con información adicional
   */
  getAll: async (): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string;
    nombre_usuario: string;
    telefono_celular: string | null;
    habilitado_sistema: boolean;
    tipo_usuario: string;
    info_estudiante: string | null;
    info_profesor: string | null;
    info_coordinador: string | null;
  }>> => {
    const query = loadSQL('usuarios/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Actualiza la contraseña de un usuario por correo electrónico
   */
  updatePasswordByEmail: async (email: string, passwordHash: string): Promise<any> => {
    const query = loadSQL('usuarios/update-password.sql');
    const result: QueryResult = await pool.query(query, [email, passwordHash]);
    return result.rows[0];
  },
};







