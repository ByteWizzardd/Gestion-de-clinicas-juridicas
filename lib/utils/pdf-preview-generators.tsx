'use client';

/**
 * Funciones de generación de PDF que retornan un Blob (sin descargar).
 * Usadas para la vista previa en el modal de reportes.
 */

import React from 'react';
import { pdf } from '@react-pdf/renderer/lib/react-pdf.browser';
import { TiposCasosPDF } from '../../components/reports/TiposCasosPDF';
import { EstatusCasosPDF, EstatusGroupedData } from '../../components/reports/EstatusCasosPDF';
import { InformeResumenPDF, InformeResumenData } from '../../components/reports/InformeResumenPDF';
import { CasosGroupedData, SocioeconomicoData } from '../../types/reports';
import InformeSocioeconomicoPDF from '../../components/reports/InformeSocioeconomicoPDF';
import { CasoHistorialPDF } from '../../components/cases/CasoHistorialPDF';
import { MultiCasoHistorialPDF } from '../../components/cases/MultiCasoHistorialPDF';
import { SolicitanteFichaPDF } from '../../components/applicants/SolicitanteFichaPDF';
import { CasoHistorialData, SolicitanteFichaData } from '../../lib/types/report-types';
import { generateBarChartImage } from './bar-chart-generator';
import {
    CHART_COLORS,
    ESTATUS_COLORS,
    generatePieChartImage,
    groupDataByMateriaSubcategoria,
    groupCasosByMateriaSubcategoria,
    groupBeneficiariosByMateriaSubcategoria,
    imageToBase64,
} from './pdf-generator-react';

const yieldToUI = (ms = 30) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Genera un blob PDF de Tipos de Casos (sin descargar)
 */
export async function generateTiposCasosPDFBlob(
    data: CasosGroupedData[],
    fechaInicio?: string,
    fechaFin?: string,
    term?: string,
    isWordFormat?: boolean
): Promise<Blob> {
    const logoBase64 = await imageToBase64('/logo clinica juridica.png');
    const groupedData = groupDataByMateriaSubcategoria(data);

    const chartImages: Record<string, string> = {};
    for (const [key, groupData] of Object.entries(groupedData)) {
        await yieldToUI();
        const values = groupData.map(item => Number(item.cantidad_casos) || 0);
        const total = values.reduce((sum, val) => sum + Number(val), 0);
        chartImages[key] = generatePieChartImage(
            groupData.map(item => item.nombre_ambito_legal),
            values,
            CHART_COLORS.slice(0, groupData.length),
            total
        );
    }

    await yieldToUI();
    const doc = React.createElement(TiposCasosPDF, { data, fechaInicio, fechaFin, chartImages, logoBase64, term, isWordFormat });
    // @ts-ignore - React PDF types issue with React 19
    return await pdf(doc).toBlob();
}

/**
 * Genera un blob PDF de Estatus de Casos (sin descargar)
 */
export async function generateEstatusCasosPDFBlob(
    data: EstatusGroupedData[],
    fechaInicio?: string,
    fechaFin?: string,
    term?: string,
    isWordFormat?: boolean
): Promise<Blob> {
    const logoBase64 = await imageToBase64('/logo clinica juridica.png');

    const values = data.map(item => Number(item.cantidad_casos) || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    const chartImage = generatePieChartImage(
        data.map(item => item.nombre_estatus),
        values,
        data.map(item => ESTATUS_COLORS[item.nombre_estatus] || '#9E9E9E'),
        total
    );

    await yieldToUI();
    const doc = React.createElement(EstatusCasosPDF, { data, fechaInicio, fechaFin, chartImage, logoBase64, term, isWordFormat });
    // @ts-ignore - React PDF types issue with React 19
    return await pdf(doc).toBlob();
}

/**
 * Genera un blob PDF de Informe Resumen (sin descargar)
 */
export async function generateInformeResumenPDFBlob(
    data: InformeResumenData,
    fechaInicio?: string,
    fechaFin?: string,
    term?: string,
    isWordFormat?: boolean,
    selectedSections?: Record<string, boolean>
): Promise<Blob> {
    const logoBase64 = await imageToBase64('/logo clinica juridica.png');
    const portadaBase64 = await imageToBase64('/portada reporte.png');

    const BAR_COLORS = [
        '#8979ff', '#ff928a', '#3cc3df', '#ffae4c', '#537ff1',
        '#6fd195', '#8c63da', '#2bb7dc', '#1f94ff', '#f4cf3b',
        '#55c4ae', '#6186cc',
    ];

    const chartImages: {
        casosPorMateria?: string;
        solicitantesPorGenero?: string;
        solicitantesPorEstado?: string;
        solicitantesPorParroquia?: string;
        estudiantesPorMateria?: Record<string, string>;
        profesoresPorMateria?: Record<string, string>;
        tiposDeCaso?: Record<string, string>;
        beneficiariosDirectos?: string;
        beneficiariosIndirectos?: string;
        beneficiariosPorParentesco?: string;
    } = {};

    // Helper to check if a section is selected (default true if undefined)
    const isSelected = (key: string) => !selectedSections || selectedSections[key];

    // Filter data based on selection to ensure pages/sections are not rendered if disabled
    const filteredData = { ...data };
    if (!isSelected('tiposDeCaso')) filteredData.tiposDeCaso = [];
    if (!isSelected('casosPorMateria')) filteredData.casosPorMateria = [];
    if (!isSelected('solicitantesPorGenero')) filteredData.solicitantesPorGenero = [];
    if (!isSelected('solicitantesPorEstado')) filteredData.solicitantesPorEstado = [];
    if (!isSelected('solicitantesPorParroquia')) filteredData.solicitantesPorParroquia = [];
    if (!isSelected('estudiantesPorMateria')) filteredData.estudiantesPorMateria = [];
    if (!isSelected('profesoresPorMateria')) filteredData.profesoresPorMateria = [];
    if (!isSelected('beneficiariosPorTipo')) filteredData.beneficiariosPorTipo = [];
    if (!isSelected('beneficiariosPorParentesco')) filteredData.beneficiariosPorParentesco = [];

    // Check if any data remains after filtering
    const hasData =
        (filteredData.tiposDeCaso && filteredData.tiposDeCaso.length > 0) ||
        (filteredData.casosPorMateria && filteredData.casosPorMateria.length > 0) ||
        (filteredData.solicitantesPorGenero && filteredData.solicitantesPorGenero.length > 0) ||
        (filteredData.solicitantesPorEstado && filteredData.solicitantesPorEstado.length > 0) ||
        (filteredData.solicitantesPorParroquia && filteredData.solicitantesPorParroquia.length > 0) ||
        (filteredData.estudiantesPorMateria && filteredData.estudiantesPorMateria.length > 0) ||
        (filteredData.profesoresPorMateria && filteredData.profesoresPorMateria.length > 0) ||
        (filteredData.beneficiariosPorTipo && filteredData.beneficiariosPorTipo.length > 0) ||
        (filteredData.beneficiariosPorParentesco && filteredData.beneficiariosPorParentesco.length > 0);

    if (!hasData) {
        return new Blob([], { type: 'application/pdf' }); // Return empty blob to signal no data
    }

    // Tipos de Caso
    if (filteredData.tiposDeCaso?.length > 0) {
        const groupedData = groupDataByMateriaSubcategoria(filteredData.tiposDeCaso);
        chartImages.tiposDeCaso = {};
        for (const [key, groupData] of Object.entries(groupedData)) {
            await yieldToUI();
            const values = groupData.map(item => Number(item.cantidad_casos) || 0);
            const total = values.reduce((sum, val) => sum + Number(val), 0);
            chartImages.tiposDeCaso[key] = generatePieChartImage(
                groupData.map(item => item.nombre_ambito_legal), values,
                CHART_COLORS.slice(0, groupData.length), total
            );
        }
    }

    // Casos por Materia
    if (filteredData.casosPorMateria?.length > 0) {
        await yieldToUI();
        const groupedCasos = groupCasosByMateriaSubcategoria(filteredData.casosPorMateria);
        const labels: string[] = [];
        const values: number[] = [];
        for (const [key, groupData] of Object.entries(groupedCasos)) {
            labels.push(key);
            values.push(groupData.reduce((sum, item) => sum + Number(item.cantidad_casos || 0), 0));
        }
        chartImages.casosPorMateria = generateBarChartImage(labels, values, BAR_COLORS.slice(0, labels.length));
    }

    // Solicitantes por Género
    if (filteredData.solicitantesPorGenero?.length > 0) {
        await yieldToUI();
        chartImages.solicitantesPorGenero = generateBarChartImage(
            filteredData.solicitantesPorGenero.map(item => item.genero === 'M' ? 'Masculino' : 'Femenino'),
            filteredData.solicitantesPorGenero.map(item => item.cantidad_solicitantes),
            filteredData.solicitantesPorGenero.map(item => item.genero === 'F' ? '#ff928a' : '#8979ff')
        );
    }

    // Solicitantes por Estado
    if (filteredData.solicitantesPorEstado?.length > 0) {
        await yieldToUI();
        chartImages.solicitantesPorEstado = generateBarChartImage(
            filteredData.solicitantesPorEstado.map(item => item.nombre_estado),
            filteredData.solicitantesPorEstado.map(item => item.cantidad_solicitantes),
            BAR_COLORS.slice(0, filteredData.solicitantesPorEstado.length)
        );
    }

    // Solicitantes por Parroquia
    if (filteredData.solicitantesPorParroquia?.length > 0) {
        await yieldToUI();
        chartImages.solicitantesPorParroquia = generateBarChartImage(
            filteredData.solicitantesPorParroquia.map(item => item.nombre_parroquia),
            filteredData.solicitantesPorParroquia.map(item => item.cantidad_solicitantes),
            BAR_COLORS.slice(0, filteredData.solicitantesPorParroquia.length)
        );
    }

    // Estudiantes por Materia
    if (filteredData.estudiantesPorMateria?.length > 0) {
        await yieldToUI();
        const groupedByMateria: Record<string, number> = {};
        for (const item of filteredData.estudiantesPorMateria) {
            groupedByMateria[item.nombre_materia] = (groupedByMateria[item.nombre_materia] || 0) + item.cantidad_estudiantes;
        }
        chartImages.estudiantesPorMateria = {
            total: generateBarChartImage(Object.keys(groupedByMateria), Object.values(groupedByMateria).map(v => Number(v)), BAR_COLORS.slice(0, Object.keys(groupedByMateria).length))
        };
    }

    // Profesores por Materia
    if (filteredData.profesoresPorMateria?.length > 0) {
        await yieldToUI();
        const groupedByMateria: Record<string, number> = {};
        for (const item of filteredData.profesoresPorMateria) {
            groupedByMateria[item.nombre_materia] = (groupedByMateria[item.nombre_materia] || 0) + item.cantidad_profesores;
        }
        chartImages.profesoresPorMateria = {
            total: generateBarChartImage(Object.keys(groupedByMateria), Object.values(groupedByMateria).map(v => Number(v)), BAR_COLORS.slice(0, Object.keys(groupedByMateria).length))
        };
    }

    // Beneficiarios Directos e Indirectos (Agrupados por 'beneficiariosPorTipo')
    if (filteredData.beneficiariosPorTipo?.length > 0) {
        // Beneficiarios Directos
        await yieldToUI();
        const directos = filteredData.beneficiariosPorTipo.filter(item => item.tipo_beneficiario === 'Directo');
        if (directos.length > 0) {
            const groupedDirectos = groupBeneficiariosByMateriaSubcategoria(directos);
            const labels: string[] = [];
            const values: number[] = [];
            for (const [key, groupData] of Object.entries(groupedDirectos)) {
                labels.push(key);
                values.push(groupData.reduce((sum, item) => sum + Number(item.cantidad_beneficiarios || 0), 0));
            }
            chartImages.beneficiariosDirectos = generateBarChartImage(labels, values, BAR_COLORS.slice(0, labels.length));
        }

        // Beneficiarios Indirectos
        await yieldToUI();
        const indirectos = filteredData.beneficiariosPorTipo.filter(item => item.tipo_beneficiario === 'Indirecto');
        if (indirectos.length > 0) {
            const groupedIndirectos = groupBeneficiariosByMateriaSubcategoria(indirectos);
            const labels: string[] = [];
            const values: number[] = [];
            for (const [key, groupData] of Object.entries(groupedIndirectos)) {
                labels.push(key);
                values.push(groupData.reduce((sum, item) => sum + Number(item.cantidad_beneficiarios || 0), 0));
            }
            chartImages.beneficiariosIndirectos = generateBarChartImage(labels, values, BAR_COLORS.slice(0, labels.length));
        }
    }

    // Beneficiarios por Parentesco
    if (filteredData.beneficiariosPorParentesco?.length > 0) {
        await yieldToUI();
        chartImages.beneficiariosPorParentesco = generateBarChartImage(
            filteredData.beneficiariosPorParentesco.map(item => item.parentesco),
            filteredData.beneficiariosPorParentesco.map(item => Number(item.cantidad_beneficiarios)),
            BAR_COLORS.slice(0, filteredData.beneficiariosPorParentesco.length)
        );
    }

    await yieldToUI(100);
    const doc = React.createElement(InformeResumenPDF, { data: filteredData, fechaInicio, fechaFin, chartImages, logoBase64, portadaBase64, term, isWordFormat });
    await yieldToUI(100);
    // @ts-ignore - React PDF types issue with React 19
    return await pdf(doc).toBlob();
}

/**
 * Genera un blob PDF de Informe Socioeconómico (sin descargar)
 */
export async function generateSocioeconomicoPDFBlob(
    data: SocioeconomicoData,
    fechaInicio?: string,
    fechaFin?: string,
    term?: string,
    isWordFormat?: boolean,
    selectedSections?: Record<string, boolean>
): Promise<Blob> {
    await yieldToUI();

    // Helper to check selection
    const isSelected = (key: string) => !selectedSections || selectedSections[key];

    // Filter data
    const filteredData = { ...data };
    if (!isSelected('genero')) filteredData.distribucionPorGenero = [];
    if (!isSelected('edad')) filteredData.distribucionPorEdad = [];
    if (!isSelected('estadoCivil')) filteredData.distribucionPorEstadoCivil = [];
    if (!isSelected('nivelEducativo')) filteredData.distribucionPorNivelEducativo = [];
    if (!isSelected('condicionTrabajo')) filteredData.distribucionPorCondicionTrabajo = [];
    if (!isSelected('condicionActividad')) filteredData.distribucionPorCondicionActividad = [];
    if (!isSelected('ingresos')) filteredData.distribucionPorIngresos = [];
    if (!isSelected('tamanoHogar')) filteredData.distribucionPorTamanoHogar = [];
    if (!isSelected('ninosHogar')) filteredData.distribucionPorNinosHogar = [];
    if (!isSelected('trabajadoresHogar')) filteredData.distribucionPorTrabajadoresHogar = [];
    if (!isSelected('dependientes')) filteredData.distribucionPorDependientes = [];
    if (!isSelected('habitaciones')) filteredData.distribucionPorHabitaciones = [];
    if (!isSelected('banos')) filteredData.distribucionPorBanos = [];

    // Filter Characteristics manually
    if (filteredData.distribucionPorCaracteristicasVivienda) {
        filteredData.distribucionPorCaracteristicasVivienda = filteredData.distribucionPorCaracteristicasVivienda.filter(item => {
            const name = item.nombre_tipo_caracteristica.toLowerCase();

            // Housing Type
            if (name.includes('tipo de vivienda') || name.includes('tipo_vivienda') || name.includes('tipo vivienda')) {
                return isSelected('tipoVivienda');
            }

            // Specific Services
            if (name.includes('agua')) return isSelected('aguaPotable');
            if (name.includes('aseo') || name.includes('basura') || name.includes('desechos')) return isSelected('aseoUrbano');
            if (name.includes('negra') || name.includes('servida') || name.includes('residual') || name.includes('cloaca')) return isSelected('aguasNegras');
            if (name.includes('artefact') || name.includes('bienes') || name.includes('electro') || name.includes('enseres') || name.includes('dom')) return isSelected('artefactosHogar');
            if (name.includes('piso')) return isSelected('materialPiso');
            if (name.includes('techo') || name.includes('cubierta')) return isSelected('materialTecho');
            if (name.includes('pared')) return isSelected('materialParedes');

            // Do not show anything else by default
            return false;
        });
    }

    // Check if any data remains
    const hasData = Object.values(filteredData).some(arr => Array.isArray(arr) && arr.length > 0);
    if (!hasData) {
        return new Blob([], { type: 'application/pdf' });
    }

    const chartImages: Record<string, string> = {};
    const BAR_COLORS_SOCIO = ['#8979ff', '#ff928a', '#3cc3df', '#ffae4c', '#537ff1', '#6fd195', '#8c63da', '#2bb7dc', '#1f94ff', '#f4cf3b'];

    if (filteredData.distribucionPorTipoVivienda?.length > 0 && isSelected('tipoVivienda')) {
        // Legacy field, usually empty if using CaracteristicasVivienda, but keeping logic
        const labels = filteredData.distribucionPorTipoVivienda.map((item: any) => item.tipo_vivienda as string);
        const values = filteredData.distribucionPorTipoVivienda.map((item: any) => Number(item.cantidad_solicitantes));
        chartImages.tipoVivienda = generateBarChartImage(labels, values, BAR_COLORS_SOCIO.slice(0, labels.length));
    }
    await yieldToUI();

    if (filteredData.distribucionPorGenero?.length > 0) {
        chartImages.genero = generateBarChartImage(
            filteredData.distribucionPorGenero.map(item => item.genero === 'M' ? 'Masculino' : 'Femenino'),
            filteredData.distribucionPorGenero.map(item => Number(item.cantidad_solicitantes)),
            filteredData.distribucionPorGenero.map(item => item.genero === 'F' ? '#ff928a' : '#8979ff')
        );
    }
    await yieldToUI();

    const socioFields = [
        { key: 'edad', data: filteredData.distribucionPorEdad, cat: 'rango_edad' },
        { key: 'estadoCivil', data: filteredData.distribucionPorEstadoCivil, cat: 'estado_civil' },
        { key: 'nivelEducativo', data: filteredData.distribucionPorNivelEducativo, cat: 'nivel_educativo' },
        { key: 'condicionTrabajo', data: filteredData.distribucionPorCondicionTrabajo, cat: 'condicion_trabajo' },
        { key: 'condicionActividad', data: filteredData.distribucionPorCondicionActividad, cat: 'condicion_actividad' },
        { key: 'ingresos', data: filteredData.distribucionPorIngresos, cat: 'rango_ingresos' },
        { key: 'tamanoHogar', data: filteredData.distribucionPorTamanoHogar, cat: 'tamano_hogar' },
        { key: 'trabajadoresHogar', data: filteredData.distribucionPorTrabajadoresHogar, cat: 'trabajadores_hogar' },
        { key: 'dependientes', data: filteredData.distribucionPorDependientes, cat: 'cantidad_dependientes' },
        { key: 'ninosHogar', data: filteredData.distribucionPorNinosHogar, cat: 'ninos_hogar' },
        { key: 'habitaciones', data: filteredData.distribucionPorHabitaciones, cat: 'cant_habitaciones' },
        { key: 'banos', data: filteredData.distribucionPorBanos, cat: 'cant_banos' },
    ];

    for (const field of socioFields) {
        if (field.data?.length > 0) {
            const labels = field.data.map((item: any) => item[field.cat] as string);
            const values = field.data.map((item: any) => Number(item.cantidad_solicitantes));
            chartImages[field.key] = generateBarChartImage(labels, values, BAR_COLORS_SOCIO.slice(0, labels.length));
            await yieldToUI();
        }
    }

    if (filteredData.distribucionPorCaracteristicasVivienda?.length > 0) {
        const grouped: Record<string, any[]> = {};
        filteredData.distribucionPorCaracteristicasVivienda.forEach(item => {
            const type = item.nombre_tipo_caracteristica;
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(item);
        });
        for (const [type, items] of Object.entries(grouped)) {
            const key = `caract_${type.replace(/\s+/g, '_').toLowerCase()}`;
            const labels = items.map((item: any) => item.caracteristica as string);
            const values = items.map((item: any) => Number(item.cantidad_solicitantes));
            chartImages[key] = generateBarChartImage(labels, values, BAR_COLORS_SOCIO.slice(0, labels.length));
            await yieldToUI();
        }
    }

    const logoBase64 = await imageToBase64('/logo clinica juridica.png');
    // Also pass filtered data to PDF
    const doc = React.createElement(InformeSocioeconomicoPDF, { data: filteredData, fechaInicio, fechaFin, chartImages, logoBase64, term, isWordFormat });
    // @ts-ignore - React PDF types issue with React 19
    return await pdf(doc).toBlob();
}

/**
 * Genera un blob PDF de Historial de Caso (sin descargar)
 * Soporta uno o múltiples casos.
 */
export async function generateCasoHistorialPDFBlob(
    data: CasoHistorialData | CasoHistorialData[]
): Promise<Blob> {
    const logoBase64 = await imageToBase64('/logo escuela derecho.png');
    const dataArray = Array.isArray(data) ? data : [data];

    await yieldToUI();

    // Usar MultiCasoHistorialPDF siempre, ya que maneja un array.
    // Si es un solo caso, será un array de 1 elemento.
    const doc = React.createElement(MultiCasoHistorialPDF, {
        data: dataArray,
        logoBase64
    });
    // @ts-ignore - React PDF types issue with React 19
    return await pdf(doc).toBlob();
}

/**
 * Genera un blob PDF de Ficha de Solicitante (sin descargar)
 * Usa el PDF de SolicitanteFichaPDF
 */
export async function generateSolicitanteFichaPDFBlob(
    data: SolicitanteFichaData
): Promise<Blob> {
    const logoBase64 = await imageToBase64('/logo escuela derecho.png');

    await yieldToUI();
    const doc = React.createElement(SolicitanteFichaPDF, {
        data: {
            ...data,
            casos: data.casos || [],
            beneficiarios: data.beneficiarios || []
        },
        logoBase64
    });
    // @ts-ignore - React PDF types issue with React 19
    return await pdf(doc).toBlob();
}
