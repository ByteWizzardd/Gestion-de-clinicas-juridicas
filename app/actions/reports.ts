'use server';

import { cookies } from 'next/headers';
import { casosQueries } from '@/lib/db/queries/casos.queries';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes.queries';
import { estudiantesQueries } from '@/lib/db/queries/estudiantes.queries';
import { profesoresQueries } from '@/lib/db/queries/profesores.queries';
import { beneficiariosQueries } from '@/lib/db/queries/beneficiarios.queries';
import { verifyToken } from '@/lib/utils/security';
import { pool } from '@/lib/db/pool';
import {
  mapCaseLoadTrendData,
  mapDistributionData,
  mapKPIData,
  mapStatusDistributionData,
  mapTopCasesData,
} from '@/lib/utils/reports-data-mapper';

export interface CasosGroupedData {
  id_materia: number;
  num_categoria: number;
  num_subcategoria: number;
  num_ambito_legal: number;
  nombre_materia: string;
  nombre_categoria: string;
  nombre_subcategoria: string;
  nombre_ambito_legal: string;
  cantidad_casos: number;
}

export interface EstatusGroupedData {
  nombre_estatus: string;
  cantidad_casos: number;
}

export interface BeneficiariosGroupedData {
  tipo_beneficiario: string;
  id_materia: number;
  num_categoria: number;
  num_subcategoria: number;
  nombre_materia: string;
  nombre_categoria: string;
  nombre_subcategoria: string;
  cantidad_beneficiarios: number;
}

export interface SocioeconomicoData {
  distribucionPorTipoVivienda: Array<{ tipo_vivienda: string; cantidad_solicitantes: number }>;
  distribucionPorGenero: Array<{ genero: string; cantidad_solicitantes: number }>;
  distribucionPorEdad: Array<{ rango_edad: string; cantidad_solicitantes: number }>;
  distribucionPorEstadoCivil: Array<{ estado_civil: string; cantidad_solicitantes: number }>;
  distribucionPorNivelEducativo: Array<{ nivel_educativo: string; cantidad_solicitantes: number }>;
  distribucionLaboralFusionada: Array<{ categoria: string; cantidad_solicitantes: number }>;
  distribucionPorCondicionTrabajo: Array<{ condicion_trabajo: string; cantidad_solicitantes: number }>;
  distribucionPorCondicionActividad: Array<{ condicion_actividad: string; cantidad_solicitantes: number }>;
  distribucionPorIngresos: Array<{ rango_ingresos: string; cantidad_solicitantes: number }>;
  distribucionPorTamanoHogar: Array<{ tamano_hogar: string; cantidad_solicitantes: number }>;
  distribucionPorTrabajadoresHogar: Array<{ trabajadores_hogar: string; cantidad_solicitantes: number }>;
  distribucionPorDependientes: Array<{ cantidad_dependientes: string; cantidad_solicitantes: number }>;
  distribucionPorNinosHogar: Array<{ ninos_hogar: string; cantidad_solicitantes: number }>;
  distribucionPorHabitaciones: Array<{ cant_habitaciones: string; cantidad_solicitantes: number }>;
  distribucionPorBanos: Array<{ cant_banos: string; cantidad_solicitantes: number }>;
  distribucionPorCaracteristicasVivienda: Array<{
    nombre_tipo_caracteristica: string;
    caracteristica: string;
    cantidad_solicitantes: number
  }>;
}

/**
 * Obtiene distribución de casos por Tipo de Trámite (Ámbito Legal)
 */
export async function getDistributionByTramite(
  fechaInicio?: string,
  fechaFin?: string,
  idNucleo?: number, // Not used in specific query but kept for signature consistency if extended later
  term?: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) throw new Error('No autorizado');

    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    // Usamos casosQueries para obtener los datos
    const dbData = await casosQueries.getDistributionByTramite(
      start || undefined,
      end || undefined,
      idNucleo
    );

    // Mapeamos a formato de gráfica
    const formattedData = dbData.map(item => ({
      name: item.nombre_tramite,
      value: Number(item.cantidad_casos),
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    console.error('Error al obtener distribución por trámite:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Obtiene casos agrupados por ámbito legal para generar reportes
 */
export async function getCasosGroupedByAmbitoLegal(
  fechaInicio?: string,
  fechaFin?: string,
  term?: string
): Promise<{ success: boolean; data?: CasosGroupedData[]; error?: string }> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    // Verificar token
    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    // Si hay term, obtener sus fechas
    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    const data = await casosQueries.getGroupedByAmbitoLegal(
      start || undefined,
      end || undefined
    );

    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener casos agrupados:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtiene datos de tendencia de carga de casos
 */
export async function getCaseLoadTrend(
  fechaInicio?: string,
  fechaFin?: string,
  idNucleo?: number,
  term?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    // Si hay term, obtener sus fechas
    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getCaseLoadTrend(
      start,
      end,
      idNucleo,
      undefined // No filtrar por term en el SQL si ya tenemos las fechas
    );

    // Mapear datos al formato de la gráfica
    const chartData = mapCaseLoadTrendData(dbData);

    return { success: true, data: chartData };
  } catch (error) {
    console.error('Error al obtener datos de tendencia de carga:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}


/**
 * Obtiene distribución de solicitantes por género
 */
export async function getDistributionByGender(
  fechaInicio?: string,
  fechaFin?: string,
  idNucleo?: number, // Note: Not used in query currently but kept for interface consistency
  term?: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) throw new Error('No autorizado');

    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    const { solicitantesQueries } = await import('@/lib/db/queries/solicitantes.queries');
    const data = await solicitantesQueries.getDistribucionGenero(start || undefined, end || undefined);

    // Map 'M'/'F' to full names
    const formattedData = data.map(item => ({
      name: item.genero === 'M' ? 'Masculino' : item.genero === 'F' ? 'Femenino' : item.genero,
      value: Number(item.cantidad_solicitantes),
      color: item.genero === 'M' ? '#4A90E2' : item.genero === 'F' ? '#FF69B4' : '#9E9E9E'
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    console.error('Error al obtener distribución por género:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Obtiene datos de distribución por núcleo
 */
export async function getDistributionByNucleo(
  fechaInicio?: string,
  fechaFin?: string,
  idNucleo?: number,
  term?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    // Si hay term, obtener sus fechas
    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getDistributionByNucleo(
      start,
      end,
      idNucleo,
      undefined
    );

    // Mapear datos al formato de la gráfica
    const chartData = mapDistributionData(dbData);

    return { success: true, data: chartData };
  } catch (error) {
    console.error('Error al obtener datos de distribución:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtiene opciones para los filtros de reportes
 */
export async function getFilterOptions(): Promise<{
  success: boolean;
  data?: {
    dateRangeOptions: Array<{ value: string; label: string }>;
    nucleoOptions: Array<{ value: string; label: string }>;
    termOptions: Array<{ value: string; label: string }>;
  };
  error?: string;
}> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    // Obtener núcleos
    const nucleosResult = await pool.query(
      'SELECT id_nucleo, nombre_nucleo FROM nucleos ORDER BY nombre_nucleo'
    );

    // Obtener términos (semestres)
    const termsResult = await pool.query(
      'SELECT term FROM semestres ORDER BY term DESC'
    );

    // Opciones de rango de fechas (predefinidas)
    const dateRangeOptions = [
      { value: 'all', label: 'Todo el tiempo' },
      { value: 'last-week', label: 'Última semana' },
      { value: 'last-month', label: 'Último mes' },
      { value: 'last-3-months', label: 'Últimos 3 meses' },
      { value: 'last-year', label: 'Último año' },
    ];

    // Formatear núcleos
    const nucleoOptions = [
      { value: 'all', label: 'Todos los núcleos' },
      ...nucleosResult.rows.map((row) => ({
        value: row.id_nucleo.toString(),
        label: row.nombre_nucleo,
      })),
    ];

    // Formatear términos
    const termOptions = [
      { value: 'all', label: 'Todos los periodos' },
      ...termsResult.rows.map((row) => ({
        value: row.term,
        label: row.term,
      })),
    ];

    return {
      success: true,
      data: {
        dateRangeOptions,
        nucleoOptions,
        termOptions,
      },
    };
  } catch (error) {
    console.error('Error al obtener opciones de filtros:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtiene estadísticas KPI
 */
export async function getKPIStats(
  fechaInicio?: string,
  fechaFin?: string,
  idNucleo?: number,
  term?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    // Si hay term, obtener sus fechas
    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getKPIStats(
      start,
      end,
      idNucleo,
      undefined
    );

    // Mapear datos al formato del dashboard
    const kpiData = mapKPIData(dbData);

    return { success: true, data: kpiData };
  } catch (error) {
    console.error('Error al obtener datos KPI:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtiene datos de distribución por estatus
 */
export async function getDistributionByStatus(
  fechaInicio?: string,
  fechaFin?: string,
  idNucleo?: number,
  term?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    // Si hay term, obtener sus fechas
    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getDistributionByStatus(
      start,
      end,
      idNucleo,
      undefined
    );

    // Mapear datos al formato de la gráfica
    const chartData = mapStatusDistributionData(dbData);

    return { success: true, data: chartData };
  } catch (error) {
    console.error('Error al obtener datos de distribución por estatus:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtiene datos de los casos más frecuentes
 */
export async function getTopCases(
  fechaInicio?: string,
  fechaFin?: string,
  idNucleo?: number,
  term?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    // Si hay term, obtener sus fechas
    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getTopMaterias(
      start,
      end,
      idNucleo,
      undefined
    );

    // Mapear datos al formato de la gráfica
    const chartData = mapTopCasesData(dbData);

    return { success: true, data: chartData };
  } catch (error) {
    console.error('Error al obtener datos de top casos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtiene casos agrupados por estatus para generar reportes
 */
export async function getCasosGroupedByEstatus(
  fechaInicio?: string,
  fechaFin?: string,
  term?: string
): Promise<{ success: boolean; data?: EstatusGroupedData[]; error?: string }> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    // Verificar token
    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    // Si hay term, obtener sus fechas
    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    const dbData = await casosQueries.getGroupedByEstatus(
      start || undefined,
      end || undefined
    );

    // Mapear a EstatusGroupedData
    const data: EstatusGroupedData[] = dbData.map(item => ({
      nombre_estatus: item.nombre_estatus,
      cantidad_casos: Number(item.cantidad_casos),
    }));

    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener casos agrupados por estatus:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtiene todos los datos para el informe resumen de casos
 */
export async function getInformeResumenData(
  fechaInicio?: string,
  fechaFin?: string,
  term?: string
): Promise<{
  success: boolean;
  data?: {
    casosPorMateria: Array<{
      id_materia: number;
      num_categoria: number;
      num_subcategoria: number;
      nombre_materia: string;
      nombre_categoria: string;
      nombre_subcategoria: string;
      cantidad_casos: number;
    }>;
    solicitantesPorGenero: Array<{ genero: string; cantidad_solicitantes: number }>;
    solicitantesPorEstado: Array<{ nombre_estado: string; cantidad_solicitantes: number }>;
    solicitantesPorParroquia: Array<{ nombre_parroquia: string; cantidad_solicitantes: number }>;
    casosPorAmbitoLegal: Array<{ nombre_ambito_legal: string; cantidad_casos: number }>;
    estudiantesPorMateria: Array<{
      nombre_materia: string;
      nombre_categoria: string | null;
      nombre_subcategoria: string | null;
      cantidad_estudiantes: number
    }>;
    profesoresPorMateria: Array<{
      nombre_materia: string;
      nombre_categoria: string | null;
      nombre_subcategoria: string | null;
      cantidad_profesores: number
    }>;
    tiposDeCaso: CasosGroupedData[];
    beneficiariosPorTipo: BeneficiariosGroupedData[];
    beneficiariosPorParentesco: Array<{ parentesco: string; cantidad_beneficiarios: number }>;
  };
  error?: string;
}> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    // Si hay term, obtener sus fechas
    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    // Obtener todos los datos en paralelo
    const [
      casosPorMateria,
      solicitantesPorGenero,
      solicitantesPorEstado,
      solicitantesPorParroquia,
      casosPorAmbitoLegal,
      estudiantesPorMateria,
      profesoresPorMateria,
      tiposDeCaso,
      beneficiariosPorTipo,
      beneficiariosPorParentesco,
    ] = await Promise.all([
      casosQueries.getByMateriaGrouped(start, end),
      solicitantesQueries.getByGenero(start, end),
      solicitantesQueries.getByEstado(start, end),
      solicitantesQueries.getByParroquia(start, end),
      casosQueries.getByAmbitoLegalTotal(start, end),
      estudiantesQueries.getByMateria(start, end),
      profesoresQueries.getByMateria(start, end),
      casosQueries.getGroupedByAmbitoLegal(start, end),
      beneficiariosQueries.getByTipoGrouped(start, end),
      beneficiariosQueries.getByParentesco(start, end),
    ]);

    return {
      success: true,
      data: {
        casosPorMateria,
        solicitantesPorGenero,
        solicitantesPorEstado,
        solicitantesPorParroquia,
        casosPorAmbitoLegal,
        estudiantesPorMateria,
        profesoresPorMateria,
        tiposDeCaso,
        beneficiariosPorTipo,
        beneficiariosPorParentesco,
      },
    };
  } catch (error) {
    console.error('Error al obtener datos del informe resumen:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtiene los datos del informe socioeconómico (paso a paso, empezando con vivienda)
 */
export async function getInformeSocioeconomicoData(
  fechaInicio?: string,
  fechaFin?: string,
  term?: string
): Promise<{
  success: boolean;
  data?: SocioeconomicoData;
  error?: string;
}> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }

    // Si hay term, obtener sus fechas
    let start = fechaInicio;
    let end = fechaFin;
    if (term && term !== 'all') {
      const { semestresQueries } = await import('@/lib/db/queries/semestres.queries');
      const semestre = await semestresQueries.getByTerm(term);
      if (semestre) {
        start = semestre.fecha_inicio.toISOString().split('T')[0];
        end = semestre.fecha_fin.toISOString().split('T')[0];
      }
    }

    // Obtener distribuciones socioeconómicas
    const [
      distribucionPorTipoVivienda,
      distribucionPorGenero,
      distribucionPorEdad,
      distribucionPorEstadoCivil,
      distribucionPorNivelEducativo,
      distribucionLaboralFusionada,
      distribucionPorCondicionTrabajo,
      distribucionPorCondicionActividad,
      distribucionPorIngresos,
      distribucionPorTamanoHogar,
      distribucionPorTrabajadoresHogar,
      distribucionPorDependientes,
      distribucionPorNinosHogar,
      distribucionPorHabitaciones,
      distribucionPorBanos,
      distribucionPorCaracteristicasVivienda
    ] = await Promise.all([
      solicitantesQueries.getByTipoVivienda(start, end),
      solicitantesQueries.getDistribucionGenero(start, end),
      solicitantesQueries.getDistribucionEdad(start, end),
      solicitantesQueries.getDistribucionEstadoCivil(start, end),
      solicitantesQueries.getDistribucionNivelEducativo(start, end),
      solicitantesQueries.getDistribucionLaboralFusionada(start, end),
      solicitantesQueries.getDistribucionCondicionTrabajo(start, end),
      solicitantesQueries.getDistribucionCondicionActividad(start, end),
      solicitantesQueries.getDistribucionIngresos(start, end),
      solicitantesQueries.getDistribucionTamanoHogar(start, end),
      solicitantesQueries.getDistribucionTrabajadoresHogar(start, end),
      solicitantesQueries.getDistribucionDependientes(start, end),
      solicitantesQueries.getDistribucionNinosHogar(start, end),
      solicitantesQueries.getDistribucionHabitaciones(start, end),
      solicitantesQueries.getDistribucionBanos(start, end),
      solicitantesQueries.getDistribucionCaracteristicasVivienda(start, end),
    ]);

    return {
      success: true,
      data: {
        distribucionPorTipoVivienda,
        distribucionPorGenero,
        distribucionPorEdad,
        distribucionPorEstadoCivil,
        distribucionPorNivelEducativo,
        distribucionLaboralFusionada,
        distribucionPorCondicionTrabajo,
        distribucionPorCondicionActividad,
        distribucionPorIngresos,
        distribucionPorTamanoHogar,
        distribucionPorTrabajadoresHogar,
        distribucionPorDependientes,
        distribucionPorNinosHogar,
        distribucionPorHabitaciones,
        distribucionPorBanos,
        distribucionPorCaracteristicasVivienda
      },
    };
  } catch (error) {
    console.error('Error al obtener datos del informe socioeconómico:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
