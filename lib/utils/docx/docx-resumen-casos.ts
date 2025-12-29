/**
 * Generador de documento Word (.docx) para el reporte de Resumen de Casos
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
    BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
import { InformeResumenData } from '@/components/reports/InformeResumenPDF';
import {
    groupDataByMateriaSubcategoria,
    imageToBase64,
    formatGroupTitle
} from '../pdf-generator-react';
import { formatDate, base64ToUint8Array } from './docx-utils';
import {
    generateTitleImage,
    generateBannerImage,
    generateChartImage,
    generateLegendImage,
    generateGenericBarChartImage,
    generateGenericLegendImage
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
 * Crea una página de portada
 */
async function createCoverPage(portadaBase64: string) {
    const portadaUint8 = base64ToUint8Array(portadaBase64.split(',')[1]);
    return {
        properties: {
            page: {
                size: {
                    orientation: PageOrientation.PORTRAIT,
                    width: 11906,
                    height: 16838
                },
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
            },
        },
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new ImageRun({
                        data: portadaUint8,
                        transformation: { width: 630, height: 891 }, // A4 proporciones
                    } as any),
                ],
            }),
        ],
    };
}

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
    legendUint8?: Uint8Array,
    legendInsertWidth?: number,
    legendInsertHeight?: number,
    vAlign: any = VerticalAlign.CENTER
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

    if (legendUint8 && legendInsertWidth && legendInsertHeight) {
        rows.push(new TableRow({
            children: [
                new TableCell({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new ImageRun({
                                    data: legendUint8,
                                    transformation: {
                                        width: legendInsertWidth,
                                        height: legendInsertHeight
                                    },
                                } as any),
                            ],
                        }),
                    ],
                    verticalAlign: VerticalAlign.BOTTOM,
                    borders: {
                        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                    },
                }),
            ],
        }));
    }

    return new Table({
        rows: rows,
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
    });
}

/**
 * Genera y descarga un documento Word (.docx) para el reporte de Resumen de Casos
 */
export async function generateResumenCasosDOCX(
    data: InformeResumenData,
    fechaInicio?: string,
    fechaFin?: string,
    term?: string
): Promise<void> {
    try {
        const logoBase64 = await imageToBase64('/logo clinica juridica.png');
        const portadaBase64 = await imageToBase64('/portada reporte.png');
        const logoUint8 = base64ToUint8Array(logoBase64.split(',')[1]);

        const sections: any[] = [];
        const reportTitle = `Informe Resumen de Casos${term ? ` Semestre ${term}` : (fechaInicio && fechaFin ? ` ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}` : '')}`;

        // 1. Portada
        sections.push(await createCoverPage(portadaBase64));

        // 2. Tipos de Caso (Pie Charts agrupados)
        const groupedTiposCasos = groupDataByMateriaSubcategoria(data.tiposDeCaso);
        let isFirstPage = true;

        for (const [key, groupData] of Object.entries(groupedTiposCasos)) {
            const chartImageBase64 = await generateChartImage(groupData);
            const chartUint8 = base64ToUint8Array(chartImageBase64.split(',')[1]);

            const legendResult = await generateLegendImage(groupData);
            const legendUint8 = base64ToUint8Array(legendResult.base64.split(',')[1]);

            const legendWidth = 950;
            const legendHeight = Math.round((legendResult.height / legendResult.width) * legendWidth);

            const topContent: any[] = [];
            // Logo
            topContent.push(new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 240, after: 120 },
                indent: { left: 200 },
                children: [new ImageRun({ data: logoUint8, transformation: { width: 260, height: 45.5 } } as any)],
            }));

            // Banner (solo primera pág de contenido)
            if (isFirstPage) {
                const bannerBase64 = await generateBannerImage(reportTitle);
                topContent.push(new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 60 },
                    children: [new ImageRun({ data: base64ToUint8Array(bannerBase64.split(',')[1]), transformation: { width: 830, height: 34 } } as any)],
                }));
            }

            // Título Sección
            const titleImg = await generateTitleImage(formatGroupTitle(groupData[0]));
            topContent.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: isFirstPage ? 0 : 100, after: 50 },
                children: [new ImageRun({ data: base64ToUint8Array(titleImg.split(',')[1]), transformation: { width: 800, height: 44 } } as any)],
            }));

            // Gráfica (Dimensiones ajustadas para mantener aspect ratio y evitar distorsión en la primera página)
            topContent.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new ImageRun({ data: chartUint8, transformation: { width: isFirstPage ? 650 : 830, height: isFirstPage ? 432 : 550 } } as any)],
            }));

            const pageTable = createPageTable(topContent, legendUint8, legendWidth, legendHeight, VerticalAlign.CENTER);
            sections.push(createLandscapePageSection(pageTable));
            isFirstPage = false;
        }

        // 3. Gráficos de Barras (Casos por Materia, Solicitantes, etc.)
        const barCharts = [
            {
                title: 'Casos por Materia',
                labels: Array.from(new Set(data.casosPorMateria.map(item => item.nombre_materia))),
                getValues: () => {
                    const map = new Map();
                    data.casosPorMateria.forEach(item => {
                        map.set(item.nombre_materia, (map.get(item.nombre_materia) || 0) + Number(item.cantidad_casos));
                    });
                    return Array.from(map.values());
                }
            },
            {
                title: 'Solicitantes por Género',
                labels: data.solicitantesPorGenero.map(item => item.genero === 'M' ? 'Masculino' : 'Femenino'),
                values: data.solicitantesPorGenero.map(item => item.cantidad_solicitantes)
            },
            {
                title: 'Solicitantes por Estado',
                labels: data.solicitantesPorEstado.map(item => item.nombre_estado),
                values: data.solicitantesPorEstado.map(item => item.cantidad_solicitantes)
            },
            {
                title: 'Solicitantes por Parroquia',
                labels: data.solicitantesPorParroquia.map(item => item.nombre_parroquia),
                values: data.solicitantesPorParroquia.map(item => item.cantidad_solicitantes)
            },
            {
                title: 'Beneficiarios Directos',
                labels: Array.from(new Set(data.beneficiariosPorTipo.filter(i => i.tipo_beneficiario === 'Directo').map(i => i.nombre_materia))),
                getValues: () => {
                    const map = new Map();
                    data.beneficiariosPorTipo.filter(i => i.tipo_beneficiario === 'Directo').forEach(item => {
                        map.set(item.nombre_materia, (map.get(item.nombre_materia) || 0) + Number(item.cantidad_beneficiarios));
                    });
                    return Array.from(map.values());
                }
            },
            {
                title: 'Beneficiarios Indirectos',
                labels: Array.from(new Set(data.beneficiariosPorTipo.filter(i => i.tipo_beneficiario === 'Indirecto').map(i => i.nombre_materia))),
                getValues: () => {
                    const map = new Map();
                    data.beneficiariosPorTipo.filter(i => i.tipo_beneficiario === 'Indirecto').forEach(item => {
                        map.set(item.nombre_materia, (map.get(item.nombre_materia) || 0) + Number(item.cantidad_beneficiarios));
                    });
                    return Array.from(map.values());
                }
            },
            {
                title: 'Beneficiarios por Parentesco',
                labels: data.beneficiariosPorParentesco.map(item => item.parentesco),
                values: data.beneficiariosPorParentesco.map(item => item.cantidad_beneficiarios)
            },
            {
                title: 'Estudiantes Involucrados',
                labels: Array.from(new Set(data.estudiantesPorMateria.map(item => item.nombre_materia))),
                getValues: () => {
                    const map = new Map();
                    data.estudiantesPorMateria.forEach(item => {
                        map.set(item.nombre_materia, (map.get(item.nombre_materia) || 0) + Number(item.cantidad_estudiantes));
                    });
                    return Array.from(map.values());
                }
            },
            {
                title: 'Profesores Involucrados',
                labels: Array.from(new Set(data.profesoresPorMateria.map(item => item.nombre_materia))),
                getValues: () => {
                    const map = new Map();
                    data.profesoresPorMateria.forEach(item => {
                        map.set(item.nombre_materia, (map.get(item.nombre_materia) || 0) + Number(item.cantidad_profesores));
                    });
                    return Array.from(map.values());
                }
            }
        ];

        for (const chart of barCharts) {
            const labels = chart.labels;
            const values = 'values' in chart ? chart.values : chart.getValues!();

            // Omitir si no hay datos
            if (!labels || labels.length === 0 || !values || values.every(v => v === 0)) {
                continue;
            }

            const colors = BAR_CHART_COLORS.slice(0, labels.length);

            const chartBase64 = await generateGenericBarChartImage(labels, values as number[], colors);
            const chartUint8 = base64ToUint8Array(chartBase64.split(',')[1]);

            const topContent: any[] = [];
            // Logo
            topContent.push(new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: isFirstPage ? 120 : 240, after: 120 },
                indent: { left: 200 },
                children: [new ImageRun({ data: logoUint8, transformation: { width: 260, height: 45.5 } } as any)],
            }));

            // Título Sección
            const titleImg = await generateTitleImage(chart.title);
            topContent.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 50 },
                children: [new ImageRun({ data: base64ToUint8Array(titleImg.split(',')[1]), transformation: { width: 800, height: 44 } } as any)],
            }));

            // Espacio vacío para bajar la gráfica considerablemente
            topContent.push(new Paragraph({ spacing: { before: 1200 } }));

            // Gráfica (Aspect ratio corregido para evitar distorsión)
            topContent.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new ImageRun({ data: chartUint8, transformation: { width: 850, height: 366 } } as any)],
            }));

            const pageTable = createPageTable(topContent, undefined, undefined, undefined, VerticalAlign.TOP);
            sections.push(createLandscapePageSection(pageTable));
        }

        const doc = new Document({ sections: sections });
        const blob = await Packer.toBlob(doc);
        const periodLabel = term ? `Semestre_${term}` : `${fechaInicio || 'all'}_${fechaFin || 'all'}`;
        saveAs(blob, `Informe_Resumen_Casos_${periodLabel}.docx`);
    } catch (error) {
        console.error('Error al generar DOCX:', error);
        throw error;
    }
}
