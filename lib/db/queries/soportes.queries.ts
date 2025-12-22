import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Soportes
 * Todas las queries SQL están en database/queries/soportes/
 */
export const soportesQueries = {
  /**
   * Crea un nuevo soporte para un caso
   * @param data Datos del soporte incluyendo el archivo como Buffer
   */
  create: async (data: {
    id_caso: number;
    documento_data: Buffer;
    nombre_archivo: string;
    tipo_mime: string;
    descripcion?: string;
    fecha_consignacion?: string | Date;
  }): Promise<any> => {
    const query = loadSQL('soportes/create.sql');
    const fechaConsignacionStr = data.fecha_consignacion
      ? (typeof data.fecha_consignacion === 'string' 
          ? data.fecha_consignacion 
          : data.fecha_consignacion.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      data.id_caso,
      data.documento_data,
      data.nombre_archivo,
      data.tipo_mime,
      data.descripcion || null,
      fechaConsignacionStr,
    ]);
    return result.rows[0];
  },
};

