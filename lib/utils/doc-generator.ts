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
import { CasosGroupedData } from '@/app/actions/reports';
import { 
    groupDataByMateriaSubcategoria, 
    imageToBase64, 
    CHART_COLORS,
    generatePieChartImage,
    formatGroupTitle
} from './pdf-generator-react';

/**
 * Formatea una fecha a DD/MM/YYYY
 */
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Convierte una cadena base64 en un Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Genera una imagen del título de sección (League Spartan SemiBold/Bold)
 * Texto más grande para mejor visibilidad
 */
async function generateTitleImage(text: string): Promise<string> {
    const canvas = document.createElement('canvas');
    const pixelRatio = 2;
    const w = 900;
    const h = 50;
    canvas.width = w * pixelRatio;
    canvas.height = h * pixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.scale(pixelRatio, pixelRatio);
    
    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    
    // Texto en League Spartan Bold para que se vea igual al PDF
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px "League Spartan", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
    
    return canvas.toDataURL('image/png', 1.0);
}

/**
 * Genera una imagen del banner rojo con bordes redondeados y texto
 */
async function generateBannerImage(text: string): Promise<string> {
    const canvas = document.createElement('canvas');
    const pixelRatio = 2;
    const w = 880; // Ancho específico solicitado
    const h = 36;   // Un poco menos alto
    canvas.width = w * pixelRatio;
    canvas.height = h * pixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.scale(pixelRatio, pixelRatio);
    
    // Rectángulo con bordes redondeados
    const r = 7; // Bordes un poco más redondeados
    ctx.fillStyle = '#9c2327';
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    // Texto más grande
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "League Spartan", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + 1);
    
    return canvas.toDataURL('image/png', 1.0);
}

/**
 * Genera SOLO la imagen de la gráfica (sin leyenda)
 * Esto permite que la gráfica sea más grande
 */
async function generateChartImage(
    groupData: CasosGroupedData[]
): Promise<string> {
    const pixelRatio = 2;
    // Gráfica más grande para aprovechar mejor el espacio
    const baseWidth = 950;
    const baseHeight = 630;
    
    const canvas = document.createElement('canvas');
    canvas.width = baseWidth * pixelRatio;
    canvas.height = baseHeight * pixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.scale(pixelRatio, pixelRatio);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    // Generar la gráfica
    const values = groupData.map(item => Number(item.cantidad_casos) || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    const labels = groupData.map(item => item.nombre_ambito_legal);
    const colors = CHART_COLORS.slice(0, groupData.length);
    
    const chartBase64 = generatePieChartImage(labels, values, colors, total);
    const chartImg = new Image();
    chartImg.src = chartBase64;
    await new Promise(r => chartImg.onload = r);
    
    // Dibujar la gráfica ocupando todo el canvas
    ctx.drawImage(chartImg, 0, 0, baseWidth, baseHeight);
    
    return canvas.toDataURL('image/png', 1.0);
}

/**
 * Genera SOLO la imagen de la leyenda
 * Retorna la imagen y sus dimensiones para inserción proporcional
 */
async function generateLegendImage(
    groupData: CasosGroupedData[]
): Promise<{ base64: string; width: number; height: number }> {
    const pixelRatio = 2;
    const labels = groupData.map(item => item.nombre_ambito_legal);
    const colors = CHART_COLORS.slice(0, groupData.length);
    
    // Calcular dimensiones necesarias - MÁS ANCHO para llegar hasta los márgenes
    const baseWidth = 1100;
    const dotRadius = 7;
    const paddingX = 22;
    const lineHeight = 26;
    
    // Crear canvas temporal para medir texto
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return { base64: '', width: 0, height: 0 };
    tempCtx.font = '14px Inter, Arial, sans-serif';
    
    // Calcular líneas
    const maxLineWidth = baseWidth - 40; // Menos margen para aprovechar más espacio
    const lines: Array<{ labels: string[], colors: string[], widths: number[] }> = [];
    let currentLine = { labels: [] as string[], colors: [] as string[], widths: [] as number[] };
    let currentLineWidth = 0;

    labels.forEach((label, index) => {
        const textWidth = tempCtx.measureText(label).width;
        const itemWidth = (dotRadius * 2) + 10 + textWidth + paddingX;
        
        if (currentLineWidth + itemWidth > maxLineWidth && currentLine.labels.length > 0) {
            lines.push(currentLine);
            currentLine = { labels: [], colors: [], widths: [] };
            currentLineWidth = 0;
        }
        
        currentLine.labels.push(label);
        currentLine.colors.push(colors[index % colors.length]);
        currentLine.widths.push(itemWidth);
        currentLineWidth += itemWidth;
    });
    
    if (currentLine.labels.length > 0) {
        lines.push(currentLine);
    }

    // Altura basada en número de líneas
    const baseHeight = Math.max(40, lines.length * lineHeight + 20);
    
    const canvas = document.createElement('canvas');
    canvas.width = baseWidth * pixelRatio;
    canvas.height = baseHeight * pixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return { base64: '', width: 0, height: 0 };
    
    ctx.scale(pixelRatio, pixelRatio);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, baseWidth, baseHeight);
    
    ctx.font = '14px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Dibujar leyendas centradas
    lines.forEach((line, lineIndex) => {
        const lineWidth = line.widths.reduce((sum, w) => sum + w, 0);
        let currentX = (baseWidth - lineWidth) / 2;
        const currentY = 10 + lineIndex * lineHeight + lineHeight / 2;

        line.labels.forEach((label, itemIndex) => {
            // Punto de color
            ctx.fillStyle = line.colors[itemIndex];
            ctx.beginPath();
            ctx.arc(currentX + dotRadius, currentY, dotRadius, 0, Math.PI * 2);
            ctx.fill();

            // Texto
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillText(label, currentX + (dotRadius * 2) + 8, currentY);
            currentX += line.widths[itemIndex];
        });
    });
    
    return {
        base64: canvas.toDataURL('image/png', 1.0),
        width: baseWidth,
        height: baseHeight
    };
}

/**
 * Genera y descarga un documento Word (.docx) para el reporte de Tipos de Caso
 */
export async function generateTiposCasosDOCX(
    data: CasosGroupedData[],
    fechaInicio?: string,
    fechaFin?: string
): Promise<void> {
    try {
        const logoBase64 = await imageToBase64('/logo clinica juridica.png');
        const logoData = logoBase64.split(',')[1];
        const logoUint8 = base64ToUint8Array(logoData);
        
        const groupedData = groupDataByMateriaSubcategoria(data);
        const sections: any[] = [];

        const reportTitle = `Tipos de Caso${fechaInicio && fechaFin ? ` ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}` : ''}`;

        let isFirstPage = true;

        for (const [key, groupData] of Object.entries(groupedData)) {
            // Generar imágenes separadas
            const chartImageBase64 = await generateChartImage(groupData);
            const chartUint8 = base64ToUint8Array(chartImageBase64.split(',')[1]);
            
            const legendResult = await generateLegendImage(groupData);
            const legendUint8 = base64ToUint8Array(legendResult.base64.split(',')[1]);
            
            // Calcular tamaño proporcional para la leyenda (ancho más grande para llegar a los márgenes)
            const legendInsertWidth = 950; // Más ancho para llegar hasta los márgenes
            const legendInsertHeight = Math.round((legendResult.height / legendResult.width) * legendInsertWidth);

            // Contenido superior (logo, banner, título, gráfica)
            const topContent: any[] = [];

            // 1. Logo (más grande y un poco más a la derecha) - EN TODAS LAS PÁGINAS
            topContent.push(
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 120 }, // Un poquito más de margen inferior
                    indent: {
                        left: 200, // Mover un poco a la derecha
                    },
                    children: [
                        new ImageRun({
                            data: logoUint8,
                            transformation: { width: 260, height: 45.5 }, // Más grande
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
                                transformation: { width: 830, height: 34 }, // Ancho 880px
                            } as any),
                        ],
                    })
                );
            }

            // 3. Título de sección como imagen (League Spartan Bold)
            const sectionTitle = formatGroupTitle(groupData[0]);
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
                            transformation: { width: 830, height: 550 }, // Gráfica más grande
                        } as any),
                    ],
                })
            );

            // Usar una tabla de 3 filas para centrar verticalmente el contenido
            const pageTable = new Table({
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
                                verticalAlign: VerticalAlign.CENTER, // Centrar verticalmente
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

            sections.push({
                properties: {
                    page: {
                        size: { 
                            orientation: PageOrientation.LANDSCAPE, 
                            width: 11906,
                            height: 16838
                        },
                        margin: { 
                            top: 200, // Menos margen superior para el logo en todas las páginas
                            right: 567,  
                            bottom: 300, // Menos margen abajo para que la leyenda llegue hasta el borde
                            left: 200 // Menos margen izquierdo para el logo en todas las páginas
                        },
                    },
                },
                children: [pageTable],
            });
            
            isFirstPage = false;
        }

        const doc = new Document({ sections: sections });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Tipos_de_Casos_${fechaInicio || 'all'}_${fechaFin || 'all'}.docx`);
    } catch (error) {
        console.error('Error al generar DOCX:', error);
        throw error;
    }
}

