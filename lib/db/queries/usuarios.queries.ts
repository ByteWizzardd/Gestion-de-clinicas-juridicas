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
};

