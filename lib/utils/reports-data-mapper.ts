/**
 * Data mapper utilities for transforming database results to chart-ready formats
 * Separates database logic from presentation logic
 */

// Chart data interfaces
export interface DistributionData {
    name: string;
    value: number;
    color: string;
}

export interface TopCasesData {
    name: string;
    value: number;
}

export interface KPIData {
    totalCasos: number;
    casosEnRiesgo: number;
    totalAcciones: number;
    casosArchivados: number;
    materiaComun: string;
    cantidadMateriaComun: number;
    tasaCierrePorcentaje: number;
    promedioAccionesPorCaso: number;
    casosPendientesCierre: number;
}

// Color palette for distribution chart
const DISTRIBUTION_COLORS = [
    '#00CED1', // Cyan
    '#9C27B0', // Purple
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFD93D', // Yellow
    '#6C5CE7', // Indigo
    '#A8E6CF', // Mint
    '#FF8B94', // Pink
];

/**
 * Maps database distribution results to chart-ready format with colors
 * @param dbData - Array of {nombre_nucleo: string, cantidad: number}
 * @returns Array of DistributionData with assigned colors
 */
export function mapDistributionData(
    dbData: Array<{ nombre_nucleo: string; cantidad: number }>
): DistributionData[] {
    return dbData.map((item, index) => ({
        name: item.nombre_nucleo,
        value: Number(item.cantidad),
        color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
    }));
}

/**
 * Maps database top materias results to chart-ready format
 * @param dbData - Array of {nombre_materia: string, cantidad: number}
 * @returns Array of TopCasesData
 */
export function mapTopCasesData(
    dbData: Array<{ nombre_materia: string; cantidad: number }>
): TopCasesData[] {
    return dbData.map((item) => {
        // Remover el prefijo "Materia " si existe para acortar las etiquetas
        const name = item.nombre_materia.replace(/^Materia\s+/i, '');
        return {
            name,
            value: Number(item.cantidad),
        };
    });
}

/**
 * Maps database KPI stats to dashboard-ready format
 * @param dbData - KPI stats object from database
 * @returns KPIData object with calculated fields
 */
export function mapKPIData(dbData: {
    total_casos: number;
    casos_en_riesgo: number;
    total_acciones: number;
    casos_archivados: number;
    materia_mas_comun: string;
    cantidad_materia_comun: number;
    tasa_cierre_porcentaje: number;
}): KPIData {
    const totalCasos = Number(dbData.total_casos);
    const totalAcciones = Number(dbData.total_acciones);
    const casosArchivados = Number(dbData.casos_archivados);

    return {
        totalCasos,
        casosEnRiesgo: Number(dbData.casos_en_riesgo),
        totalAcciones,
        casosArchivados,
        materiaComun: dbData.materia_mas_comun || 'N/A',
        cantidadMateriaComun: Number(dbData.cantidad_materia_comun),
        tasaCierrePorcentaje: Number(dbData.tasa_cierre_porcentaje),
        promedioAccionesPorCaso: totalCasos > 0 ? Math.round((totalAcciones / totalCasos) * 10) / 10 : 0,
        casosPendientesCierre: totalCasos - casosArchivados,
    };
}

// Additional chart data interfaces
export interface StatusDistributionData {
    name: string;
    value: number;
    color: string;
}

export interface CaseLoadTrendData {
    mes: string;
    [key: string]: number | string; // Dynamic keys for each status
}

// Color palette for status distribution (pie chart)
const STATUS_COLORS: Record<string, string> = {
    'En proceso': '#4A90E2', // Blue
    'Archivado': '#7B68EE', // Purple
    'Entregado': '#50C878', // Green
    'Asesoría': '#D2691E', // Brown/Orange
};

/**
 * Maps database status distribution results to pie chart format with colors
 * @param dbData - Array of {nombre_estatus: string, cantidad: number}
 * @returns Array of StatusDistributionData with assigned colors
 */
export function mapStatusDistributionData(
    dbData: Array<{ nombre_estatus: string; cantidad: number }>
): StatusDistributionData[] {
    return dbData.map((item) => ({
        name: item.nombre_estatus,
        value: Number(item.cantidad),
        color: STATUS_COLORS[item.nombre_estatus] || '#9E9E9E',
    }));
}

/**
 * Maps database case load trend results to line chart format
 * Transforms from long format (mes, estatus, cantidad) to wide format (mes, [estatus]: cantidad)
 * @param dbData - Array of {mes: string, estatus: string, cantidad: number}
 * @returns Array of CaseLoadTrendData with dynamic status columns
 */
export function mapCaseLoadTrendData(
    dbData: Array<{ mes: string; estatus: string; cantidad: number }>
): CaseLoadTrendData[] {
    // Group by month
    const grouped = dbData.reduce((acc, item) => {
        if (!acc[item.mes]) {
            acc[item.mes] = { mes: item.mes };
        }
        acc[item.mes][item.estatus] = Number(item.cantidad);
        return acc;
    }, {} as Record<string, CaseLoadTrendData>);

    // Convert to array and sort by month
    return Object.values(grouped).sort((a, b) => a.mes.localeCompare(b.mes));
}

/**
 * Get unique status names from trend data for chart legend
 * @param trendData - Array of CaseLoadTrendData
 * @returns Array of status names
 */
export function getStatusNamesFromTrend(trendData: CaseLoadTrendData[]): string[] {
    const statusSet = new Set<string>();
    trendData.forEach((item) => {
        Object.keys(item).forEach((key) => {
            if (key !== 'mes') {
                statusSet.add(key);
            }
        });
    });
    return Array.from(statusSet);
}
