/**
 * Generador de documento Word (.docx) para el reporte de Tipos de Caso
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
import { CasosGroupedData } from '@/types/reports';
import {
    groupDataByMateriaSubcategoria,
    imageToBase64,
    generatePieChartImage,
    formatGroupTitle
} from '../pdf-generator-react';
import { formatDate, base64ToUint8Array } from './docx-utils';
import {
    generateTitleImage,
    generateBannerImage,
    generateChartImage,
    generateLegendImage
} from './docx-image-generators';

/**
 * Crea una sección de página vacía vertical con márgenes estándar de Word
 */
function createEmptyPortraitPage() {
    return {
        properties: {
            page: {
                size: {
                    orientation: PageOrientation.PORTRAIT,
                    width: 11906,
                    height: 16838
                },
                margin: {
                    top: 1440,    // 1 pulgada (2.54 cm) - margen superior estándar
                    right: 1800,  // 1.25 pulgadas (3.18 cm) - margen derecho estándar
                    bottom: 1440, // 1 pulgada (2.54 cm) - margen inferior estándar
                    left: 1800    // 1.25 pulgadas (3.18 cm) - margen izquierdo estándar
                },
            },
        },
        children: [],
    };
}

/**
 * Crea el contenido superior de una página (logo, banner, título, gráfica)
 */
async function createTopContent(
    logoUint8: Uint8Array,
    reportTitle: string,
    sectionTitle: string,
    chartUint8: Uint8Array,
    isFirstPage: boolean
): Promise<any[]> {
    const topContent: any[] = [];

    // 1. Logo (más grande y un poco más a la derecha) - EN TODAS LAS PÁGINAS
    topContent.push(
        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            indent: {
                left: 200,
            },
            children: [
                new ImageRun({
                    data: logoUint8,
                    transformation: { width: 260, height: 45.5 },
                } as any),
            ],
        })
    );

    // 2. Banner con bordes redondeados (Solo en la primera página)
    if (isFirstPage) {
        const bannerBase64 = await generateBannerImage(reportTitle);
        topContent.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [
                    new ImageRun({
                        data: base64ToUint8Array(bannerBase64.split(',')[1]),
                        transformation: { width: 830, height: 34 },
                    } as any),
                ],
            })
        );
    }

    // 3. Título de sección como imagen (League Spartan Bold)
    const titleImageBase64 = await generateTitleImage(sectionTitle);
    topContent.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: isFirstPage ? 0 : 100, after: 50 },
            children: [
                new ImageRun({
                    data: base64ToUint8Array(titleImageBase64.split(',')[1]),
                    transformation: { width: 800, height: 44 },
                } as any),
            ],
        })
    );

    // 4. Gráfica (MÁS GRANDE - aprovecha mejor el espacio)
    topContent.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new ImageRun({
                    data: chartUint8,
                    transformation: { width: 830, height: 550 },
                } as any),
            ],
        })
    );

    return topContent;
}

/**
 * Crea una tabla de página con contenido centrado verticalmente
 */
function createPageTable(
    topContent: any[],
    legendUint8: Uint8Array,
    legendInsertWidth: number,
    legendInsertHeight: number
): Table {
    return new Table({
        rows: [
            // Fila vacía superior (empuja el contenido hacia abajo)
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
            // Fila central: contenido principal (centrado verticalmente)
            new TableRow({
                children: [
                    new TableCell({
                        children: topContent,
                        verticalAlign: VerticalAlign.CENTER,
                        borders: {
                            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        },
                    }),
                ],
            }),
            // Fila inferior: leyenda (siempre al final, tamaño proporcional)
            new TableRow({
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
            }),
        ],
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
    });
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
 * Genera y descarga un documento Word (.docx) para el reporte de Tipos de Caso
 */
export async function generateTiposCasosDOCX(
    data: CasosGroupedData[],
    fechaInicio?: string,
    fechaFin?: string,
    term?: string
): Promise<void> {
    try {
        const logoBase64 = await imageToBase64('/logo clinica juridica.png');
        const logoData = logoBase64.split(',')[1];
        const logoUint8 = base64ToUint8Array(logoData);

        const groupedData = groupDataByMateriaSubcategoria(data);
        const sections: any[] = [];

        const reportTitle = `Tipos de Caso${term ? ` Semestre ${term}` : (fechaInicio && fechaFin ? ` ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}` : '')}`;

        // Primera hoja vacía con orientación vertical y márgenes estándar de Word
        sections.push(createEmptyPortraitPage());

        let isFirstPage = true;

        for (const [key, groupData] of Object.entries(groupedData)) {
            // Generar imágenes separadas
            const chartImageBase64 = await generateChartImage(groupData);
            const chartUint8 = base64ToUint8Array(chartImageBase64.split(',')[1]);

            const legendResult = await generateLegendImage(groupData);
            const legendUint8 = base64ToUint8Array(legendResult.base64.split(',')[1]);

            // Calcular tamaño proporcional para la leyenda
            const legendInsertWidth = 950;
            const legendInsertHeight = Math.round((legendResult.height / legendResult.width) * legendInsertWidth);

            // Crear contenido superior
            const sectionTitle = formatGroupTitle(groupData[0]);
            const topContent = await createTopContent(
                logoUint8,
                reportTitle,
                sectionTitle,
                chartUint8,
                isFirstPage
            );

            // Crear tabla de página
            const pageTable = createPageTable(
                topContent,
                legendUint8,
                legendInsertWidth,
                legendInsertHeight
            );

            // Agregar sección de página
            sections.push(createLandscapePageSection(pageTable));

            isFirstPage = false;
        }

        const doc = new Document({ sections: sections });
        const blob = await Packer.toBlob(doc);
        const periodLabel = term ? `Semestre_${term}` : (fechaInicio && fechaFin ? `${fechaInicio}_${fechaFin}` : 'Historico');
        saveAs(blob, `Tipos_de_Casos_${periodLabel}.docx`);
    } catch (error) {
        console.error('Error al generar DOCX:', error);
        throw error;
    }
}

