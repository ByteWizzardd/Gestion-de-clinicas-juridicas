import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Casos
 * Todas las queries SQL están en database/queries/casos/
 */
export const casosQueries = {
  /**
   * Obtiene todos los casos con información del solicitante
   */
  getAll: async (): Promise<any[]> => {
    const query = loadSQL('casos/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Obtiene todos los casos con información del solicitante y profesor responsable (optimizado)
   * Usa un JOIN LATERAL para evitar N+1 queries
   */
  getAllWithProfesor: async (): Promise<any[]> => {
    const query = loadSQL('casos/get-all-with-profesor.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Obtiene un caso por su ID con información completa
   */
  getById: async (id: number): Promise<any | null> => {
    const query = loadSQL('casos/get-by-id.sql');
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Obtiene todos los casos de un solicitante específico
   * @param cedulaSolicitante - Cédula del solicitante
   */
  getBySolicitante: async (cedulaSolicitante: string): Promise<any[]> => {
    const query = loadSQL('casos/get-by-solicitante.sql');
    const result: QueryResult = await pool.query(query, [cedulaSolicitante]);
    return result.rows;
  },

  /**
   * Obtiene todos los casos donde el usuario participa
   * Incluye casos donde está asignado, ejecuta acciones, atiende citas o supervisa
   * @param cedulaUsuario - Cédula del usuario
   */
  getByUsuario: async (cedulaUsuario: string): Promise<any[]> => {
    const query = loadSQL('casos/get-by-usuario.sql');
    const result: QueryResult = await pool.query(query, [cedulaUsuario]);
    return result.rows;
  },

  /**
   * Crea un nuevo caso
   * Si fecha_solicitud no se proporciona, se usa CURRENT_DATE en la base de datos
   * Nota: El estatus se maneja mediante la tabla cambio_estatus, no directamente en casos
   */
  create: async (data: {
    tramite: string;
    observaciones?: string;
    cedula: string;
    id_nucleo: number;
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    num_ambito_legal: number;
    fecha_solicitud?: string | Date;
    fecha_inicio_caso: string | Date;
  }): Promise<any> => {
    const query = loadSQL('casos/create.sql');
    const fechaSolicitudStr = data.fecha_solicitud
      ? (typeof data.fecha_solicitud === 'string' ? data.fecha_solicitud : data.fecha_solicitud.toISOString().split('T')[0])
      : null;
    const fechaInicioStr = typeof data.fecha_inicio_caso === 'string'
      ? data.fecha_inicio_caso
      : data.fecha_inicio_caso.toISOString().split('T')[0];

    const result: QueryResult = await pool.query(query, [
      data.tramite,
      data.observaciones || null,
      data.cedula,
      data.id_nucleo,
      data.id_materia,
      data.num_categoria ?? 0, // Usar 0 si es null/undefined
      data.num_subcategoria ?? 0, // Usar 0 si es null/undefined
      data.num_ambito_legal,
      fechaSolicitudStr,
      fechaInicioStr,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene el último ID de caso registrado
   */
  getLastId: async (): Promise<number> => {
    const query = loadSQL('casos/get-last-id.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows[0]?.last_id || 0;
  },

  getAllIds: async (): Promise<number[]> => {
    const query = loadSQL('casos/get-by-id-case.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows.map(row => row.id_caso);
  },

  /**
   * Actualiza un caso existente
   * Nota: El estatus se actualiza mediante la tabla cambio_estatus, no directamente aquí
   */
  update: async (
    id: number,
    data: {
      tramite?: string;
      observaciones?: string;
      fecha_fin_caso?: string;
      id_nucleo?: number;
      id_materia?: number;
      num_categoria?: number;
      num_subcategoria?: number;
      num_ambito_legal?: number;
      fecha_solicitud?: string | Date;
    }
  ): Promise<any> => {
    const query = loadSQL('casos/update.sql');
    const result: QueryResult = await pool.query(query, [
      id,
      data.tramite || null,
      data.observaciones || null,
      data.fecha_fin_caso || null,
      data.id_nucleo || null,
      data.id_materia || null,
      data.num_categoria || null,
      data.num_subcategoria || null,
      data.num_ambito_legal || null,
      data.fecha_solicitud ? (typeof data.fecha_solicitud === 'string' ? data.fecha_solicitud : data.fecha_solicitud.toISOString().split('T')[0]) : null,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene casos agrupados por materia, categoría, subcategoría y ámbito legal con conteos
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   */
  getGroupedByAmbitoLegal: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date
  ): Promise<Array<{
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    num_ambito_legal: number;
    nombre_materia: string;
    nombre_categoria: string;
    nombre_subcategoria: string;
    nombre_ambito_legal: string;
    cantidad_casos: number;
  }>> => {
    const query = loadSQL('casos/get-grouped-by-ambito-legal.sql');
    const fechaInicioStr = fechaInicio
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [fechaInicioStr, fechaFinStr]);
    return result.rows;
  },

  /**
   * Obtiene la distribución de casos por núcleo
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   * @param idNucleo - ID del núcleo para filtrar (opcional)
   * @param term - TERM para filtrar (opcional)
   */
  getDistributionByNucleo: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date,
    idNucleo?: number,
    term?: string
  ): Promise<Array<{ nombre_nucleo: string; cantidad: number }>> => {
    const query = loadSQL('casos/get-distribution-by-nucleo.sql');
    const fechaInicioStr = fechaInicio
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
      term || null,
    ]);
    return result.rows;
  },

  /**
   * Obtiene el top 5 de tipos de casos por materia
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   * @param idNucleo - ID del núcleo para filtrar (opcional)
   * @param term - TERM para filtrar (opcional)
   */
  getTopMaterias: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date,
    idNucleo?: number,
    term?: string
  ): Promise<Array<{ nombre_materia: string; cantidad: number }>> => {
    const query = loadSQL('casos/get-top-materias.sql');
    const fechaInicioStr = fechaInicio
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
      term || null,
    ]);
    return result.rows;
  },

  /**
   * Obtiene estadísticas KPI para el dashboard
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   * @param idNucleo - ID del núcleo para filtrar (opcional)
   * @param term - TERM para filtrar (opcional)
   */
  getKPIStats: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date,
    idNucleo?: number,
    term?: string
  ): Promise<{
    total_casos: number;
    casos_en_riesgo: number;
    total_acciones: number;
    casos_archivados: number;
    materia_mas_comun: string;
    cantidad_materia_comun: number;
    tasa_cierre_porcentaje: number;
  }> => {
    const query = loadSQL('casos/get-kpi-stats.sql');
    const fechaInicioStr = fechaInicio
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
      term || null,
    ]);
    return result.rows[0] || {
      total_casos: 0,
      casos_en_riesgo: 0,
      total_acciones: 0,
      casos_archivados: 0,
      materia_mas_comun: '',
      cantidad_materia_comun: 0,
      tasa_cierre_porcentaje: 0,
    };
  },

  /**
   * Obtiene la distribución de casos por estatus
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   * @param idNucleo - ID del núcleo para filtrar (opcional)
   * @param term - TERM para filtrar (opcional)
   */
  getDistributionByStatus: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date,
    idNucleo?: number,
    term?: string
  ): Promise<Array<{ nombre_estatus: string; cantidad: number }>> => {
    const query = loadSQL('casos/get-distribution-by-status.sql');
    const fechaInicioStr = fechaInicio
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
      term || null,
    ]);
    return result.rows;
  },

  /**
   * Obtiene la tendencia de carga de casos por mes
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   * @param idNucleo - ID del núcleo para filtrar (opcional)
   * @param term - TERM para filtrar (opcional)
   */
  getCaseLoadTrend: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date,
    idNucleo?: number,
    term?: string
  ): Promise<Array<{ mes: string; estatus: string; cantidad: number }>> => {
    const query = loadSQL('casos/get-case-load-trend.sql');
    const fechaInicioStr = fechaInicio
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
      term || null,
    ]);
    return result.rows;
  },
};

