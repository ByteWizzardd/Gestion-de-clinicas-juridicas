/**
 * Generadores de imágenes para documentos Word (.docx)
 */

import { CasosGroupedData } from '@/app/actions/reports';
import { EstatusGroupedData } from '@/components/reports/EstatusCasosPDF';
import {
    CHART_COLORS,
    ESTATUS_COLORS,
    generatePieChartImage,
    imageToBase64
} from '../pdf-generator-react';
import { generateBarChartImage } from '../bar-chart-generator';

/**
 * Genera una imagen del título de sección (League Spartan SemiBold/Bold)
 * Texto más grande para mejor visibilidad
 */
export async function generateTitleImage(text: string): Promise<string> {
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
 * Genera una imagen del subtítulo (e.g. Total de Solicitantes)
 * Texto un poco más pequeño, color gris oscuro
 */
export async function generateSubtitleImage(text: string): Promise<string> {
    const canvas = document.createElement('canvas');
    const pixelRatio = 2;
    const w = 900;
    const h = 40;
    canvas.width = w * pixelRatio;
    canvas.height = h * pixelRatio;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.scale(pixelRatio, pixelRatio);

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // Texto en League Spartan para consistencia
    ctx.fillStyle = '#666666';
    ctx.font = '24px "League Spartan", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);

    return canvas.toDataURL('image/png', 1.0);
}

/**
 * Genera una imagen del banner rojo con bordes redondeados y texto
 */
export async function generateBannerImage(text: string): Promise<string> {
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
export async function generateChartImage(
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
 * Genera SOLO la imagen de la leyenda para Tipos de Caso
 * Retorna la imagen y sus dimensiones para inserción proporcional
 */
export async function generateLegendImage(
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
 * Genera una imagen de la leyenda para el reporte de estatus
 */
export async function generateEstatusLegendImage(
    data: EstatusGroupedData[]
): Promise<{ base64: string; width: number; height: number }> {
    const pixelRatio = 2;
    const labels = data.map(item => item.nombre_estatus);
    const colors = data.map(item => ESTATUS_COLORS[item.nombre_estatus] || '#9E9E9E');

    const baseWidth = 1100;
    const dotRadius = 7;
    const paddingX = 22;
    const lineHeight = 26;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return { base64: '', width: 0, height: 0 };
    tempCtx.font = '14px Inter, Arial, sans-serif';

    const maxLineWidth = baseWidth - 40;
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
        currentLine.colors.push(colors[index]);
        currentLine.widths.push(itemWidth);
        currentLineWidth += itemWidth;
    });

    if (currentLine.labels.length > 0) {
        lines.push(currentLine);
    }

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

    lines.forEach((line, lineIndex) => {
        const lineWidth = line.widths.reduce((sum, w) => sum + w, 0);
        let currentX = (baseWidth - lineWidth) / 2;
        const currentY = 10 + lineIndex * lineHeight + lineHeight / 2;

        line.labels.forEach((label, itemIndex) => {
            ctx.fillStyle = line.colors[itemIndex];
            ctx.beginPath();
            ctx.arc(currentX + dotRadius, currentY, dotRadius, 0, Math.PI * 2);
            ctx.fill();

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
 * Genera una imagen base64 de un gráfico de barras genérico
 */
export async function generateGenericBarChartImage(
    labels: string[],
    values: number[],
    colors: string[]
): Promise<string> {
    const chartBase64 = generateBarChartImage(labels, values, colors);
    return chartBase64;
}

/**
 * Genera una imagen de la leyenda genérica
 */
export async function generateGenericLegendImage(
    labels: string[],
    colors: string[]
): Promise<{ base64: string; width: number; height: number }> {
    const pixelRatio = 2;
    const baseWidth = 1100;
    const dotRadius = 7;
    const paddingX = 22;
    const lineHeight = 26;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return { base64: '', width: 0, height: 0 };
    tempCtx.font = '14px Inter, Arial, sans-serif';

    const maxLineWidth = baseWidth - 40;
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

    lines.forEach((line, lineIndex) => {
        const lineWidth = line.widths.reduce((sum, w) => sum + w, 0);
        let currentX = (baseWidth - lineWidth) / 2;
        const currentY = 10 + lineIndex * lineHeight + lineHeight / 2;

        line.labels.forEach((label, itemIndex) => {
            ctx.fillStyle = line.colors[itemIndex];
            ctx.beginPath();
            ctx.arc(currentX + dotRadius, currentY, dotRadius, 0, Math.PI * 2);
            ctx.fill();

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

