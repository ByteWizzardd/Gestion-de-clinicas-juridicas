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
  getAll: async (): Promise<unknown[]> => {
    const query = loadSQL('casos/get-all.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Obtiene todos los casos con información del solicitante y profesor responsable (optimizado)
   * Usa un JOIN LATERAL para evitar N+1 queries
   */
  getAllWithProfesor: async (): Promise<unknown[]> => {
    const query = loadSQL('casos/get-all-with-profesor.sql');
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Obtiene un caso por su ID con información completa
   */
  getById: async (id: number): Promise<unknown | null> => {
    const query = loadSQL('casos/get-by-id.sql');
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Obtiene todos los casos de un solicitante específico
   * @param cedulaSolicitante - Cédula del solicitante
   */
  getBySolicitante: async (cedulaSolicitante: string): Promise<unknown[]> => {
    const query = loadSQL('casos/get-by-solicitante.sql');
    const result: QueryResult = await pool.query(query, [cedulaSolicitante]);
    return result.rows;
  },

  /**
   * Obtiene todos los casos donde el usuario participa
   * Incluye casos donde está asignado, ejecuta acciones, atiende citas o supervisa
   * @param cedulaUsuario - Cédula del usuario
   */
  getByUsuario: async (cedulaUsuario: string): Promise<unknown[]> => {
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
    cedulaUsuarioRegistra?: string;
  }): Promise<unknown> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Establecer la variable de sesión con la cédula del usuario que registra el caso
      // Nota: SET LOCAL no acepta parámetros preparados, así que validamos y escapamos el valor
      // Esta variable es usada por el trigger para crear el cambio_estatus inicial
      if (data.cedulaUsuarioRegistra) {
        // Validar que la cédula solo contenga caracteres alfanuméricos, guiones y puntos
        if (!/^[A-Za-z0-9.\-]+$/.test(data.cedulaUsuarioRegistra)) {
          throw new Error('Formato de cédula inválido');
        }
        // Escapar comillas simples para prevenir SQL injection
        const cedulaEscapada = data.cedulaUsuarioRegistra.replace(/'/g, "''");
        // Usar SET LOCAL dentro de la transacción para que esté disponible en el trigger
        await client.query(`SET LOCAL app.usuario_registra = '${cedulaEscapada}'`);
      }

      const query = loadSQL('casos/create.sql');
      const fechaSolicitudStr = data.fecha_solicitud
        ? (typeof data.fecha_solicitud === 'string' ? data.fecha_solicitud : data.fecha_solicitud.toISOString().split('T')[0])
        : null;
      const fechaInicioStr = typeof data.fecha_inicio_caso === 'string'
        ? data.fecha_inicio_caso
        : data.fecha_inicio_caso.toISOString().split('T')[0];

      const result: QueryResult = await client.query(query, [
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

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
  ): Promise<unknown> => {
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
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
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
    idNucleo?: number  ): Promise<Array<{ nombre_nucleo: string; cantidad: number }>> => {
    const query = loadSQL('casos/get-distribution-by-nucleo.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
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
    idNucleo?: number  ): Promise<Array<{ nombre_materia: string; cantidad: number }>> => {
    const query = loadSQL('casos/get-top-materias.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
    ]);
    return result.rows;
  },

  /**
   * Obtiene casos agrupados por estatus para generar reportes
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   */
  getGroupedByEstatus: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date
  ): Promise<Array<{
    nombre_estatus: string;
    cantidad_casos: number;
    id_caso_ejemplo: number;
    fecha_solicitud_min: string;
    fecha_solicitud_max: string;
  }>> => {
    const query = loadSQL('casos/get-grouped-by-estatus.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [fechaInicioStr, fechaFinStr]);
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
    idNucleo?: number  ): Promise<{
    total_casos: number;
    casos_en_riesgo: number;
    total_acciones: number;
    casos_archivados: number;
    materia_mas_comun: string;
    cantidad_materia_comun: number;
    tasa_cierre_porcentaje: number;
  }> => {
    const query = loadSQL('casos/get-kpi-stats.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
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
    idNucleo?: number  ): Promise<Array<{ nombre_estatus: string; cantidad: number }>> => {
    const query = loadSQL('casos/get-distribution-by-status.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
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
    idNucleo?: number  ): Promise<Array<{ mes: string; estatus: string; cantidad: number }>> => {
    const query = loadSQL('casos/get-case-load-trend.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
    ]);
    return result.rows;
  },

  /**
   * Obtiene casos agrupados por materia
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   */
  getByMateria: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date
  ): Promise<Array<{ nombre_materia: string; cantidad_casos: number }>> => {
    const query = loadSQL('casos/get-by-materia.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
    ]);
    return result.rows;
  },

  /**
   * Obtiene todos los casos agrupados por ámbito legal (sin agrupar por materia)
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   */
  getByAmbitoLegalTotal: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date
  ): Promise<Array<{ nombre_ambito_legal: string; cantidad_casos: number }>> => {
    const query = loadSQL('casos/get-by-ambito-legal-total.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
    ]);
    return result.rows;
  },

  /**
   * Obtiene casos agrupados por materia, categoría y subcategoría
   * (similar a BeneficiariosGroupedData pero para casos)
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   */
  getByMateriaGrouped: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date
  ): Promise<Array<{
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    nombre_materia: string;
    nombre_categoria: string;
    nombre_subcategoria: string;
    cantidad_casos: number;
  }>> => {
    const query = loadSQL('casos/get-by-materia-grouped.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
    ]);
    return result.rows;
  },

  /**
   * Obtiene la distribución de casos por trámite
   * @param fechaInicio - Fecha de inicio del rango (opcional)
   * @param fechaFin - Fecha de fin del rango (opcional)
   * @param idNucleo - ID del núcleo para filtrar (opcional)
   */
  getDistributionByTramite: async (
    fechaInicio?: string | Date,
    fechaFin?: string | Date,
    idNucleo?: number
  ): Promise<Array<{ nombre_tramite: string; cantidad_casos: number }>> => {
    const query = loadSQL('casos/get-distribucion-tramite.sql');
    const fechaInicioStr = fechaInicio && fechaInicio !== ''
      ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
      : null;
    const fechaFinStr = fechaFin && fechaFin !== ''
      ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
      : null;

    const result: QueryResult = await pool.query(query, [
      fechaInicioStr,
      fechaFinStr,
      idNucleo || null,
    ]);
    return result.rows;
  },

  /**
   * Elimina físicamente un caso y todas sus referencias asociadas
   * @param idCaso - ID del caso a eliminar
   * @param cedulaActor - Cédula del usuario que realiza la eliminación
   * @param motivo - Motivo de la eliminación (obligatorio)
   */
  deleteFisico: async (
    idCaso: number,
    cedulaActor: string,
    motivo: string
  ): Promise<void> => {
    // Llama a la función que ya realiza la auditoría internamente
    await pool.query("SELECT eliminar_caso_fisico($1, $2, $3)", [
      idCaso,
      cedulaActor,
      motivo,
    ]);
  },
};

