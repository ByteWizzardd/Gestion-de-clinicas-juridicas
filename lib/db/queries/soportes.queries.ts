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
    id_usuario_subio: string; // Cedula del usuario que sube el archivo
  }): Promise<any> => {
    const query = loadSQL('soportes/create.sql');
    const fechaConsignacionStr = data.fecha_consignacion
      ? (typeof data.fecha_consignacion === 'string'
        ? data.fecha_consignacion
        : data.fecha_consignacion.toISOString()) // Preservar timestamp completo
      : null;

    const result: QueryResult = await pool.query(query, [
      data.id_caso,
      data.documento_data,
      data.nombre_archivo,
      data.tipo_mime,
      data.descripcion || null,
      fechaConsignacionStr,
      data.id_usuario_subio,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene todos los soportes/documentos de un caso específico
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    num_soporte: number;
    id_caso: number;
    nombre_archivo: string;
    tipo_mime: string;
    descripcion: string | null;
    fecha_consignacion: string;
    tamano_bytes: number;
    // Información de auditoría: usuario que subió
    id_usuario_subio: string | null;
    nombres_usuario_subio: string | null;
    apellidos_usuario_subio: string | null;
    nombre_completo_usuario_subio: string | null;
  }>> => {
    const query = loadSQL('soportes/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    return result.rows;
  },

  /**
   * Obtiene el documento_data de un soporte específico para descarga
   */
  getDocumento: async (idCaso: number, numSoporte: number): Promise<{
    documento_data: Buffer;
    nombre_archivo: string;
    tipo_mime: string;
  } | null> => {
    const query = loadSQL('soportes/get-documento.sql');
    const result: QueryResult = await pool.query(query, [idCaso, numSoporte]);
    if (result.rows.length === 0) {
      return null;
    }
    return {
      documento_data: result.rows[0].documento_data,
      nombre_archivo: result.rows[0].nombre_archivo,
      tipo_mime: result.rows[0].tipo_mime,
    };
  },

  /**
   * Elimina un soporte específico (registra auditoría antes de eliminar)
   * @param idCaso ID del caso
   * @param numSoporte Número del soporte
   * @param idUsuarioElimino Cedula del usuario que elimina el archivo
   * @param motivo Motivo de la eliminación
   */
  delete: async (idCaso: number, numSoporte: number, idUsuarioElimino: string, motivo: string): Promise<{
    num_soporte: number;
    id_caso: number;
    nombre_archivo: string;
  } | null> => {
    // Usar transacción para establecer las variables de sesión y ejecutar el DELETE
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Establecer las variables de sesión para el trigger usando set_config
      // El tercer parámetro 'true' hace que sea local a la transacción
      await client.query("SELECT set_config('app.usuario_elimina_soporte', $1, true)", [idUsuarioElimino]);
      await client.query("SELECT set_config('app.motivo_eliminacion_soporte', $1, true)", [motivo || '']);

      // Ejecutar el DELETE (el trigger capturará la auditoría usando OLD)
      const query = loadSQL('soportes/delete.sql');
      const result: QueryResult = await client.query(query, [idCaso, numSoporte]);

      await client.query('COMMIT');

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};

