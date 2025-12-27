'use server';

import { cookies } from 'next/headers';
import { casosQueries } from '@/lib/db/queries/casos.queries';
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

/**
 * Obtiene casos agrupados por ámbito legal para generar reportes
 */
export async function getCasosGroupedByAmbitoLegal(
  fechaInicio?: string,
  fechaFin?: string
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

    const data = await casosQueries.getGroupedByAmbitoLegal(
      fechaInicio || undefined,
      fechaFin || undefined
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

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getCaseLoadTrend(
      fechaInicio,
      fechaFin,
      idNucleo,
      term
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

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getDistributionByNucleo(
      fechaInicio,
      fechaFin,
      idNucleo,
      term
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

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getKPIStats(
      fechaInicio,
      fechaFin,
      idNucleo,
      term
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

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getDistributionByStatus(
      fechaInicio,
      fechaFin,
      idNucleo,
      term
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

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getTopMaterias(
      fechaInicio,
      fechaFin,
      idNucleo,
      term
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
  fechaFin?: string
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

    const dbData = await casosQueries.getGroupedByEstatus(
      fechaInicio || undefined,
      fechaFin || undefined
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
