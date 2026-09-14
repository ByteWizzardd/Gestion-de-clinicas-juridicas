import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { QueryResult } from 'pg';

export interface CitaCreada {
  num_cita: number;
  id_caso: number;
}

export interface Atencion {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  fecha_registro: string;
}

export interface CitaCompleta {
  num_cita: number;
  id_caso: number;
  fecha_encuentro: string;
  fecha_proxima_cita: string | null;
  orientacion: string;
  // Array de usuarios que atendieron (ahora incluye TODOS)
  atenciones: Atencion[];
  tramite: string;
  estatus: string;
  cedula: string;
  nombres_solicitante?: string;
  apellidos_solicitante?: string;
  nombre_completo_solicitante?: string;
  id_nucleo: number;
  nombre_nucleo: string;
  id_materia: number;
  num_categoria: number;
  num_subcategoria: number;
  num_ambito_legal: number;
  nombre_materia?: string;
  nombre_categoria?: string;
  nombre_subcategoria?: string;
}

/**
 * Queries para la entidad Citas
 * Todas las queries SQL están en database/queries/citas/
 */
export const citasQueries = {
  /**
   * Obtiene todas las citas con información relacionada
   * Incluye: caso, solicitante, núcleo, ámbito legal, y TODOS los usuarios que atendieron
   */
  getAll: async (): Promise<CitaCompleta[]> => {
    const query = loadSQL('citas/get-all.sql');
    const result: QueryResult = await pool.query(query);
    // Parsear el JSON de atenciones (similar a getByCaso)
    return result.rows.map((row: Record<string, any>) => ({
      ...row,
      atenciones: typeof row.atenciones === 'string'
        ? JSON.parse(row.atenciones)
        : row.atenciones || []
    })) as CitaCompleta[];
  },

  /**
   * Obtiene las citas donde un usuario específico es parte de los que atienden
   */
  getByUsuario: async (cedulaUsuario: string): Promise<CitaCompleta[]> => {
    const query = loadSQL('citas/get-by-usuario.sql');
    const result: QueryResult = await pool.query(query, [cedulaUsuario]);
    // Parsear el JSON de atenciones
    return result.rows.map((row: Record<string, any>) => ({
      ...row,
      atenciones: typeof row.atenciones === 'string'
        ? JSON.parse(row.atenciones)
        : row.atenciones || []
    })) as CitaCompleta[];
  },

  /**
   * Obtiene todas las citas de un caso específico con información de atenciones
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    num_cita: number;
    id_caso: number;
    fecha_encuentro: string;
    fecha_proxima_cita: string | null;
    orientacion: string;
    atenciones: Atencion[];
  }>> => {
    const query = loadSQL('citas/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    // Parsear el JSON de atenciones
    return result.rows.map((row: Record<string, any>) => ({
      ...row,
      atenciones: typeof row.atenciones === 'string'
        ? JSON.parse(row.atenciones)
        : row.atenciones || []
    })) as any;
  },

  /**
   * Crea una nueva cita
   */
  create: async (
    caseId: number,
    date: string,
    endDate: string | null,
    orientacion: string
  ): Promise<QueryResult<CitaCreada>> => {
    const query = loadSQL('citas/create.sql');
    return await pool.query(query, [caseId, date, endDate, orientacion]);
  },

  /**
   * Elimina una cita específica (registra auditoría antes de eliminar)
   * @param numCita Número de la cita
   * @param idCaso ID del caso
   * @param idUsuarioElimino Cedula del usuario que elimina la cita
   * @param motivo Motivo de la eliminación
   */
  delete: async (
    numCita: number,
    idCaso: number,
    idUsuarioElimino: string,
    motivo: string
  ): Promise<{
    num_cita: number;
    id_caso: number;
  } | null> => {
    // El trigger de auditoría captura el DELETE con el usuario, el motivo y el tx_id de la transacción.
    return withAuditTransaction(idUsuarioElimino, { accion_negocio: 'Eliminación de cita', motivo: motivo || '' }, async (client) => {
      const result: QueryResult = await client.query(loadSQL('citas/delete.sql'), [numCita, idCaso]);
      return result.rows[0] ?? null;
    });
  },
};


