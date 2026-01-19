'use server';

import { casosQueries } from '@/lib/db/queries/casos.queries';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes.queries';
import { estudiantesQueries } from '@/lib/db/queries/estudiantes.queries';
import { profesoresQueries } from '@/lib/db/queries/profesores.queries';
import { beneficiariosQueries } from '@/lib/db/queries/beneficiarios.queries';
import { pool } from '@/lib/db/pool';
import {
  mapCaseLoadTrendData,
  mapDistributionData,
  mapStatusDistributionData,
  mapTopCasesData,
} from '@/lib/utils/reports-data-mapper';
import { requireAuthInServerAction } from '@/lib/utils/server-auth';
import { SolicitantesService } from '@/lib/services/solicitantes.service';
import { casosService } from '@/lib/services/casos.service';
import { resolveDateRange, handleReportError } from '@/lib/utils/reports-helpers';

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
): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  try {
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { start, end } = await resolveDateRange(fechaInicio, fechaFin, term);

    // Usamos casosQueries para obtener los datos
    const dbData = await casosQueries.getDistributionByTramite(
      start,
      end,
      idNucleo
    );

    // Mapeamos a formato de gráfica
    const formattedData = dbData.map(item => ({
      name: item.nombre_tramite,
      value: Number(item.cantidad_casos),
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    return handleReportError(error, 'getDistributionByTramite');
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
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { start, end } = await resolveDateRange(fechaInicio, fechaFin, term);

    const data = await casosQueries.getGroupedByAmbitoLegal(start, end);

    return { success: true, data };
  } catch (error) {
    return handleReportError(error, 'getCasosGroupedByAmbitoLegal');
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
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { start, end } = await resolveDateRange(fechaInicio, fechaFin, term);

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getCaseLoadTrend(
      start,
      end,
      idNucleo
    );

    // Mapear datos al formato de la gráfica
    const chartData = mapCaseLoadTrendData(dbData);

    return { success: true, data: chartData };
  } catch (error) {
    return handleReportError(error, 'getCaseLoadTrend');
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
): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  try {
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { start, end } = await resolveDateRange(fechaInicio, fechaFin, term);

    const data = await solicitantesQueries.getDistribucionGenero(start, end);

    // Map 'M'/'F' to full names
    const formattedData = data.map(item => ({
      name: item.genero === 'M' ? 'Masculino' : item.genero === 'F' ? 'Femenino' : item.genero,
      value: Number(item.cantidad_solicitantes),
      color: item.genero === 'M' ? '#4A90E2' : item.genero === 'F' ? '#FF69B4' : '#9E9E9E'
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    return handleReportError(error, 'getDistributionByGender');
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
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { start, end } = await resolveDateRange(fechaInicio, fechaFin, term);

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getDistributionByNucleo(
      start,
      end,
      idNucleo
    );

    // Mapear datos al formato de la gráfica
    const chartData = mapDistributionData(dbData);

    return { success: true, data: chartData };
  } catch (error) {
    return handleReportError(error, 'getDistributionByNucleo');
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
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
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
    return handleReportError(error, 'getFilterOptions');
  }
}

/**
 * Obtiene estadísticas KPI
 */
export async function getKPIStats(): Promise<{ success: boolean; data?: Record<string, number>; error?: string }> {
  try {
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Nota: actualmente el cliente no consume estos KPI.
    // Devolvemos un shape estable para evitar fallos de tipado/import.
    return {
      success: true,
      data: {
        totalCasos: 0,
        totalSolicitantes: 0,
        totalEstudiantes: 0,
        totalProfesores: 0,
      },
    };
  } catch (error) {
    return handleReportError(error, 'getKPIStats');
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
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { start, end } = await resolveDateRange(fechaInicio, fechaFin, term);

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getDistributionByStatus(
      start,
      end,
      idNucleo
    );

    // Mapear datos al formato de la gráfica
    const chartData = mapStatusDistributionData(dbData);

    return { success: true, data: chartData };
  } catch (error) {
    return handleReportError(error, 'getDistributionByStatus');
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
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { start, end } = await resolveDateRange(fechaInicio, fechaFin, term);

    // Obtener datos de la base de datos
    const dbData = await casosQueries.getTopMaterias(
      start,
      end,
      idNucleo
    );

    // Mapear datos al formato de la gráfica
    const chartData = mapTopCasesData(dbData);

    return { success: true, data: chartData };
  } catch (error) {
    return handleReportError(error, 'getTopCases');
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
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { start, end } = await resolveDateRange(fechaInicio, fechaFin, term);

    const dbData = await casosQueries.getGroupedByEstatus(start, end);

    // Mapear a EstatusGroupedData
    const data: EstatusGroupedData[] = dbData.map(item => ({
      nombre_estatus: item.nombre_estatus,
      cantidad_casos: Number(item.cantidad_casos),
    }));

    return { success: true, data };
  } catch (error) {
    return handleReportError(error, 'getCasosGroupedByEstatus');
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
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { start, end } = await resolveDateRange(fechaInicio, fechaFin, term);

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
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { start, end } = await resolveDateRange(fechaInicio, fechaFin, term);

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
    return handleReportError(error, 'getInformeSocioeconomicoData');
  }
}

/**
 * Obtiene los datos completos de un solicitante para generar su ficha
 */
export async function getSolicitanteFichaData(cedula: string): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Usar el servicio unificado para obtener data consistente con el detalle del frontend
    const solicitanteCompleto = await SolicitantesService.getSolicitanteCompleto(cedula);

    if (!solicitanteCompleto) {
      return { success: false, error: 'Solicitante no encontrado' };
    }

    // El servicio ya devuelve los casos en "casos"
    const casosData = solicitanteCompleto.casos || [];

    // Obtener beneficiarios de todos los casos (esto es específico del reporte, no del detalle simple)
    // El servicio getSolicitanteCompleto no trae los beneficiarios anidados por defecto
    let beneficiariosData: unknown[] = [];
    if (casosData.length > 0) {
      const beneficiariosPromises = casosData.map((caso: { id_caso: number; } | null) => {
        // Asumimos que cada caso tiene la propiedad id_caso
        if (typeof caso === 'object' && caso !== null && 'id_caso' in caso) {
          return beneficiariosQueries.getByCaso((caso as { id_caso: number }).id_caso);
        }
        throw new Error('El caso no tiene la propiedad id_caso');
      });
      const beneficiariosArrays = await Promise.all(beneficiariosPromises);
      beneficiariosData = beneficiariosArrays.flat();
    }

    return {
      success: true,
      data: {
        solicitante: solicitanteCompleto,
        casos: casosData,
        beneficiarios: beneficiariosData
      }
    };
  } catch (error) {
    return handleReportError(error, 'getSolicitanteFichaData');
  }
}

/**
 * Obtiene los datos completos de un caso para generar su historial
 */
export async function getCasoHistorialData(idCaso: number): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Usar el servicio unificado que ya trae toda la info relacionada (acciones, citas, soportes, beneficiarios)
    // Esto asegura que el reporte muestre EXACTAMENTE lo mismo que la vista de detalle
    const casoCompleto = await casosService.getCasoByIdCompleto(idCaso);

    if (!casoCompleto) {
      return { success: false, error: 'Caso no encontrado' };
    }

    return {
      success: true,
      data: {
        caso: casoCompleto,
        acciones: casoCompleto.acciones || [],
        citas: casoCompleto.citas || [],
        soportes: casoCompleto.soportes || [],
        beneficiarios: casoCompleto.beneficiarios || [],
        equipo: casoCompleto.equipo || [],
        cambiosEstatus: casoCompleto.cambiosEstatus || []
      }
    };
  } catch (error) {
    return handleReportError(error, 'getCasoHistorialData');
  }
}

/**
 * Genera y descarga la ficha de un solicitante en PDF
 */
export async function descargarFichaSolicitanteAction(cedula: string): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    // Obtener datos del solicitante
    const fichaData = await getSolicitanteFichaData(cedula);
    if (!fichaData.success || !fichaData.data) {
      return { success: false, error: fichaData.error || 'Error al obtener datos del solicitante' };
    }

    // Devolver los datos para que el cliente genere el PDF
    return {
      success: true,
      data: fichaData.data
    };
  } catch (error) {
    return handleReportError(error, 'descargarFichaSolicitanteAction');
  }
}

/**
 * Genera y descarga el historial de un caso en PDF
 */
export async function descargarHistorialCasoAction(idCaso: number): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    // Obtener datos del caso
    const historialData = await getCasoHistorialData(idCaso);
    if (!historialData.success || !historialData.data) {
      return { success: false, error: historialData.error || 'Error al obtener datos del caso' };
    }

    // Devolver los datos para que el cliente genere el PDF
    return {
      success: true,
      data: historialData.data
    };
  } catch (error) {
    return handleReportError(error, 'descargarHistorialCasoAction');
  }
}

/**
 * Obtiene el historial de casos de un solicitante específico en un rango de fechas
 */
export async function getHistorialCasosBySolicitante(
  cedula: string,
  fechaInicio?: string,
  fechaFin?: string
): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  try {
    const authResult = await requireAuthInServerAction();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Resolver fechas (aunque para este específico podríamos querer usar null si están vacías, le pasamos las fechas tal cual)
    // El SQL ya maneja NULLs, así que pasamos las fechas directamente si existen

    // 1. Obtener los casos básicos filtrados
    const casosBasicos = await casosQueries.getHistorialBySolicitante(cedula, fechaInicio, fechaFin);

    if (!casosBasicos || casosBasicos.length === 0) {
      return { success: true, data: [] };
    }

    // 2. Obtener la información completa de cada caso (incluyendo citas, acciones, etc.)
    // Usamos Promise.all para hacerlo en paralelo
    const casosCompletos = await Promise.all(
      (casosBasicos as { id_caso: number }[]).map(async (casoBasico) => {
        try {
          const casoCompleto = await casosService.getCasoByIdCompleto(casoBasico.id_caso);
          return casoCompleto;
        } catch (err) {
          console.error(`Error obteniendo detalles del caso ${casoBasico.id_caso}:`, err);
          return null;
        }
      })
    );

    // Filtrar nulos por si alguno falló y mapear a la estructura esperada
    const data = casosCompletos
      .filter(c => c !== null)
      .map(c => {
        // Desestructurar para separar las listas del objeto del caso
        const {
          acciones,
          citas,
          soportes,
          beneficiarios,
          equipo,
          cambiosEstatus,
          ...casoDetails
        } = c as {
          acciones?: unknown;
          citas?: unknown;
          soportes?: unknown;
          beneficiarios?: unknown;
          equipo?: unknown;
          cambiosEstatus?: unknown;
          [key: string]: unknown;
        };

        return {
          caso: casoDetails,
          acciones,
          citas,
          soportes,
          beneficiarios,
          equipo,
          cambiosEstatus
        };
      });

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error al obtener historial de casos del solicitante:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}