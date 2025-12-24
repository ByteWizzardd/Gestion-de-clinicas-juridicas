import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Beneficiarios
 * Todas las queries SQL están en database/queries/beneficiarios/
 */
export const beneficiariosQueries = {
  /**
   * Busca beneficiarios por cédula (búsqueda parcial)
   */
  searchByCedula: async (cedula: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string | null;
    sexo: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('beneficiarios/search-by-cedula.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },

  /**
   * Obtiene un beneficiario completo por cédula (búsqueda exacta)
   */
  getByCedula: async (cedula: string): Promise<{
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string | null;
    sexo: string;
    nombre_completo: string;
  } | null> => {
    const query = loadSQL('beneficiarios/get-by-cedula.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows[0] || null;
  },

  /**
   * Obtiene todos los beneficiarios de un caso específico
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    num_beneficiario: number;
    id_caso: number;
    cedula: string | null;
    nombres: string;
    apellidos: string;
    fecha_nac: string;
    sexo: string;
    tipo_beneficiario: string;
    parentesco: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('beneficiarios/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    return result.rows;
  },
};

