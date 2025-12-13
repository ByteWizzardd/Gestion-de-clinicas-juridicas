import { loadSQL } from '../../sql-loader';
import { pool } from '../../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Clientes
 * Todas las queries SQL están en database/queries/clientes/
 */
export const clientesQueries = {
  /**
   * Busca clientes por cédula (búsqueda parcial)
   */
  searchByCedula: async (cedula: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('clientes/search-by-cedula.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },


  /**
   * Actualiza un cliente con todos los datos completos
   */
  updateComplete: async (data: {
    cedula: string;
    telefonoLocal?: string | null;
    telefonoCelular: string;
    estadoCivil?: string | null;
    concubinato?: boolean | null;
    idHogar?: number | null;
    idNivelEducativo?: number | null;
    idTrabajo?: number | null;
    idVivienda?: number | null;
  }): Promise<any> => {
    const query = loadSQL('clientes/update-complete.sql');
    const result: QueryResult = await pool.query(query, [
      data.cedula,
      data.telefonoLocal || null,
      data.telefonoCelular,
      data.estadoCivil || null,
      data.concubinato ?? null,
      data.idHogar || null,
      data.idNivelEducativo || null,
      data.idTrabajo || null,
      data.idVivienda || null,
    ]);
    return result.rows[0];
  },
};

