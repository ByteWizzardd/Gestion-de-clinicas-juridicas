import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaEliminacionSolicitantes
 * Todas las queries SQL están en database/queries/auditoria-eliminacion-solicitantes/
 */
export const auditoriaEliminacionSolicitantesQueries = {
  /**
   * Obtiene todas las eliminaciones de solicitantes con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    eliminadoPor?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    solicitante_eliminado: string;
    nombres_solicitante_eliminado: string | null;
    apellidos_solicitante_eliminado: string | null;
    nombre_completo_solicitante_eliminado: string | null;
    // Datos personales
    fecha_nacimiento: string | null;
    telefono_local: string | null;
    telefono_celular: string | null;
    correo_electronico: string | null;
    sexo: string | null;
    nacionalidad: string | null;
    estado_civil: string | null;
    concubinato: boolean | null;
    tipo_tiempo_estudio: string | null;
    tiempo_estudio: number | null;
    nivel_educativo: string | null;
    condicion_trabajo: string | null;
    condicion_actividad: string | null;
    // Ubicación
    estado: string | null;
    municipio: string | null;
    parroquia: string | null;
    // Vivienda
    cant_habitaciones: number | null;
    cant_banos: number | null;
    caracteristicas_vivienda: { tipo: string; caracteristica: string }[] | null;
    // Familia y hogar
    cant_personas: number | null;
    cant_trabajadores: number | null;
    cant_no_trabajadores: number | null;
    cant_ninos: number | null;
    cant_ninos_estudiando: number | null;
    jefe_hogar: boolean | null;
    ingresos_mensuales: number | null;
    nivel_educativo_jefe: string | null;
    // Auditoría
    eliminado_por: string | null;
    nombres_usuario_elimino: string | null;
    apellidos_usuario_elimino: string | null;
    nombre_completo_usuario_elimino: string | null;
    foto_perfil_usuario_elimino: string | null;
    motivo: string;
    fecha: string;
  }>> => {
    const query = loadSQL('auditoria-eliminacion-solicitantes/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.eliminadoPor || null,
      filters?.busqueda || null,
      filters?.orden || 'desc',
    ]);
    return result.rows;
  },

  /**
   * Obtiene el conteo total de eliminaciones de solicitantes
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-eliminacion-solicitantes/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },
};
