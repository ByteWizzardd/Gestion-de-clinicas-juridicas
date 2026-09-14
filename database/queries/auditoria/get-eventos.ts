import { pool } from '@/lib/db/pool';

export interface AuditoriaEvento {
  id: string;
  entidad: string;
  operacion: string;
  id_entidad: string | null;
  id_usuario: string | null;
  datos_anteriores: any | null;
  datos_nuevos: any | null;
  fecha_evento: Date;
  id_transaccion: string | null;
}

export const auditoriaQueries = {
  /**
   * Obtiene todos los eventos de auditoría ordenados por fecha descendente.
   */
  async getAllEventos(limit = 1000): Promise<AuditoriaEvento[]> {
    const query = `
      SELECT 
        id,
        entidad,
        operacion,
        id_entidad,
        id_usuario,
        datos_anteriores,
        datos_nuevos,
        fecha_evento,
        id_transaccion
      FROM auditoria_eventos
      ORDER BY fecha_evento DESC, id DESC
      LIMIT $1;
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  },

  /**
   * Obtiene los eventos filtrados por una entidad específica (ej. 'caso', 'usuario').
   */
  async getEventosByEntidad(entidad: string, limit = 500): Promise<AuditoriaEvento[]> {
    const query = `
      SELECT *
      FROM auditoria_eventos
      WHERE entidad = $1
      ORDER BY fecha_evento DESC, id DESC
      LIMIT $2;
    `;
    const result = await pool.query(query, [entidad, limit]);
    return result.rows;
  }
};
