/**
 * Generador de documento Word (.docx) para el reporte Socioeconómico
 */

import {
    Document,
    Packer,
    Paragraph,
    ImageRun,
    AlignmentType,
    PageOrientation,
    Table,
    TableRow,
    TableCell,
    WidthType,
    VerticalAlign,
    BorderStyle,
    TextRun
} from 'docx';
import { saveAs } from 'file-saver';
import { SocioeconomicoData } from '@/app/actions/reports';
import {
    imageToBase64
} from '../pdf-generator-react';
import { formatDate, base64ToUint8Array, createEmptyPortraitPage } from './docx-utils';
import {
    generateTitleImage,
    generateBannerImage,
    generateGenericBarChartImage,
    generateSubtitleImage
} from './docx-image-generators';

/**
 * Colores para gráficos de barras
 */
const BAR_CHART_COLORS = [
    '#8979ff', '#ff928a', '#3cc3df', '#ffae4c', '#537ff1',
    '#6fd195', '#8c63da', '#2bb7dc', '#1f94ff', '#f4cf3b',
    '#55c4ae', '#6186cc',
];

/**
 * Crea una sección de página horizontal con contenido
 */
function createLandscapePageSection(pageTable: Table) {
    return {
        properties: {
            page: {
                size: {
                    orientation: PageOrientation.LANDSCAPE,
                    width: 11906,
                    height: 16838
                },
                margin: {
                    top: 200,
                    right: 567,
                    bottom: 300,
                    left: 200
                },
            },
        },
        children: [pageTable],
    };
}

/**
 * Crea una tabla de página con contenido centrado verticalmente
 */
function createPageTable(
    topContent: any[],
    vAlign: any = VerticalAlign.TOP
): Table {
    const rows = [
        new TableRow({
            children: [
                new TableCell({
                    children: [],
                    verticalAlign: VerticalAlign.TOP,
                    borders: {
                        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                    },
                }),
            ],
        }),
        new TableRow({
            children: [
                new TableCell({
                    children: topContent,
                    verticalAlign: vAlign,
                    borders: {
                        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                    },
                }),
            ],
        }),
    ];

    return new Table({
        rows: rows,
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
    });
}

/**
 * Genera y descarga un documento Word (.docx) para el reporte Socioeconómico
 */
export async function generateSocioeconomicoDOCX(
    data: SocioeconomicoData,
    fechaInicio?: string,
    fechaFin?: string,
    term?: string
): Promise<void> {
    try {
        const logoBase64 = await imageToBase64('/logo clinica juridica.png');
        const logoUint8 = base64ToUint8Array(logoBase64.split(',')[1]);

        const sections: any[] = [];
        const reportTitle = `Datos Socioeconómicos${term ? ` Semestre ${term}` : (fechaInicio && fechaFin ? ` ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}` : '')}`;

        // 1. Primera Hoja Vacía (Estándar para impresión)
        sections.push(createEmptyPortraitPage());

        // 2. Definición de Secciones (Igual que en PDF)
        const baseSections = [
            // 1. Datos Personales/Demográficos
            { key: 'genero', title: 'Género', dataKey: 'distribucionPorGenero', labelKey: 'genero', valueKey: 'cantidad_solicitantes' },
            { key: 'edad', title: 'Rango de Edad', dataKey: 'distribucionPorEdad', labelKey: 'rango_edad', valueKey: 'cantidad_solicitantes' },
            { key: 'estadoCivil', title: 'Estado Civil', dataKey: 'distribucionPorEstadoCivil', labelKey: 'estado_civil', valueKey: 'cantidad_solicitantes' },
            { key: 'nivelEducativo', title: 'Nivel Educativo', dataKey: 'distribucionPorNivelEducativo', labelKey: 'nivel_educativo', valueKey: 'cantidad_solicitantes' },

            // 2. Situación Laboral y Económica
            { key: 'condicionTrabajo', title: 'Condición de Trabajo', dataKey: 'distribucionPorCondicionTrabajo', labelKey: 'condicion_trabajo', valueKey: 'cantidad_solicitantes' },
            { key: 'condicionActividad', title: 'Condición de Actividad', dataKey: 'distribucionPorCondicionActividad', labelKey: 'condicion_actividad', valueKey: 'cantidad_solicitantes' },
            { key: 'ingresos', title: 'Rangos de Ingresos (en dólares)', dataKey: 'distribucionPorIngresos', labelKey: 'rango_ingresos', valueKey: 'cantidad_solicitantes' },

            // 3. Entorno Familiar y Vivienda
            { key: 'tamanoHogar', title: 'Tamaño del Hogar', dataKey: 'distribucionPorTamanoHogar', labelKey: 'tamano_hogar', valueKey: 'cantidad_solicitantes' },
            { key: 'ninosHogar', title: 'Niños en el Hogar', dataKey: 'distribucionPorNinosHogar', labelKey: 'ninos_hogar', valueKey: 'cantidad_solicitantes' },
            { key: 'trabajadoresHogar', title: 'Trabajadores en el Hogar', dataKey: 'distribucionPorTrabajadoresHogar', labelKey: 'trabajadores_hogar', valueKey: 'cantidad_solicitantes' },
            { key: 'dependientes', title: 'Dependientes en el Hogar (No trabajan)', dataKey: 'distribucionPorDependientes', labelKey: 'cantidad_dependientes', valueKey: 'cantidad_solicitantes' },
            { key: 'habitaciones', title: 'Cantidad de Habitaciones', dataKey: 'distribucionPorHabitaciones', labelKey: 'cant_habitaciones', valueKey: 'cantidad_solicitantes' },
            { key: 'banos', title: 'Cantidad de Baños', dataKey: 'distribucionPorBanos', labelKey: 'cant_banos', valueKey: 'cantidad_solicitantes' },
        ];

        // 3. Secciones Dinámicas (Características de Vivienda)
        const housingSections: any[] = [];
        if (data.distribucionPorCaracteristicasVivienda?.length > 0) {
            const priorityOrder = [
                'tipo de vivienda',
                'tipo_vivienda',
                'agua potable',
                'aseo',
                'eliminación aguas negras'
            ];

            const types = Array.from(new Set(data.distribucionPorCaracteristicasVivienda.map(item => item.nombre_tipo_caracteristica)))
                .sort((a, b) => {
                    const indexA = priorityOrder.findIndex(p => a.toLowerCase().includes(p));
                    const indexB = priorityOrder.findIndex(p => b.toLowerCase().includes(p));
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    return a.localeCompare(b);
                });

            types.forEach(type => {
                housingSections.push({
                    key: `caract_${type.replace(/\s+/g, '_').toLowerCase()}`,
                    title: type,
                    isDynamicHousing: true,
                    typeName: type
                });
            });
        }

        // 4. Ordenamiento Final
        const householdSections = baseSections.filter(s => ['tamanoHogar', 'ninosHogar', 'trabajadoresHogar', 'dependientes'].includes(s.key));
        const roomsBanosSections = baseSections.filter(s => ['habitaciones', 'banos'].includes(s.key));
        const otherBaseSections = baseSections.filter(s => !['tamanoHogar', 'ninosHogar', 'trabajadoresHogar', 'dependientes', 'habitaciones', 'banos'].includes(s.key));

        const tipoViviendaSection = housingSections.filter(s =>
            s.title.toLowerCase().includes('tipo de vivienda') || s.title.toLowerCase().includes('tipo_vivienda')
        );
        const otherHousingSections = housingSections.filter(s =>
            !(s.title.toLowerCase().includes('tipo de vivienda') || s.title.toLowerCase().includes('tipo_vivienda'))
        );

        const allSections = [
            ...otherBaseSections,
            ...householdSections,
            ...tipoViviendaSection,
            ...roomsBanosSections,
            ...otherHousingSections
        ];

        // 5. Generar Páginas
        let isFirstPage = true;

        for (const section of allSections) {
            let labels: string[] = [];
            let values: number[] = [];
            let total = 0;

            // Obtener datos
            if (section.isDynamicHousing) {
                const items = data.distribucionPorCaracteristicasVivienda.filter(item => item.nombre_tipo_caracteristica === section.typeName);
                labels = items.map(item => item.caracteristica);
                values = items.map(item => Number(item.cantidad_solicitantes));
                total = values.reduce((sum, v) => sum + v, 0);
            } else {
                // @ts-ignore
                const items = data[section.dataKey] || [];
                // @ts-ignore
                labels = items.map(item => {
                    // Mapeo especial para género si es necesario
                    if (section.key === 'genero') return item.genero === 'M' ? 'Masculino' : 'Femenino';
                    // @ts-ignore
                    return item[section.labelKey];
                });
                // @ts-ignore
                values = items.map(item => Number(item[section.valueKey]));
                // @ts-ignore
                total = values.reduce((sum, v) => sum + v, 0);
            }

            // Si no hay datos, saltar
            if (values.length === 0 || values.every(v => v === 0)) continue;

            // Colores
            const colors = BAR_CHART_COLORS.slice(0, labels.length);

            // Generar imagen
            const chartBase64 = await generateGenericBarChartImage(labels, values, colors);
            const chartUint8 = base64ToUint8Array(chartBase64.split(',')[1]);

            // Construir contenido
            const topContent: any[] = [];

            // Logo
            topContent.push(new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: isFirstPage ? 120 : 240, after: 120 },
                indent: { left: 200 },
                children: [new ImageRun({ data: logoUint8, transformation: { width: 260, height: 45.5 } } as any)],
            }));

            // Banner (solo primera página de contenido)
            if (isFirstPage) {
                const bannerBase64 = await generateBannerImage(reportTitle);
                topContent.push(new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 60 },
                    children: [new ImageRun({ data: base64ToUint8Array(bannerBase64.split(',')[1]), transformation: { width: 830, height: 34 } } as any)],
                }));
            }

            // Título Sección
            const titleImg = await generateTitleImage(section.title);
            topContent.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: isFirstPage ? 0 : 50, after: 10 },
                children: [new ImageRun({ data: base64ToUint8Array(titleImg.split(',')[1]), transformation: { width: 800, height: 44 } } as any)],
            }));

            // Total Count Image
            const subtitleImg = await generateSubtitleImage(`Total de Solicitantes: ${total}`);
            topContent.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 50 },
                children: [new ImageRun({ data: base64ToUint8Array(subtitleImg.split(',')[1]), transformation: { width: 800, height: 35 } } as any)],
            }));

            // Espacio
            topContent.push(new Paragraph({ spacing: { before: isFirstPage ? 200 : 800 } }));

            // Gráfica
            topContent.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new ImageRun({ data: chartUint8, transformation: { width: 850, height: 366 } } as any)],
            }));

            const pageTable = createPageTable(topContent, VerticalAlign.TOP);
            sections.push(createLandscapePageSection(pageTable));
            isFirstPage = false;
        }

        // Generate Document
        const doc = new Document({ sections: sections });
        const blob = await Packer.toBlob(doc);
        const periodLabel = term ? `Semestre_${term}` : `${fechaInicio || 'all'}_${fechaFin || 'all'}`;
        saveAs(blob, `Informe_Socioeconomico_${periodLabel}.docx`);

    } catch (error) {
        console.error('Error al generar DOCX Socioeconómico:', error);
        throw error;
    }
}
