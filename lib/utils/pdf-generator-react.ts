'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer/lib/react-pdf.browser';
import { TiposCasosPDF } from '@/components/reports/TiposCasosPDF';
import { EstatusCasosPDF, EstatusGroupedData } from '@/components/reports/EstatusCasosPDF';
import { InformeResumenPDF, InformeResumenData } from '@/components/reports/InformeResumenPDF';
import { CasosGroupedData } from '@/app/actions/reports';
import { generateBarChartImage } from './bar-chart-generator';

// Colores exactos del diseño de Figma
export const CHART_COLORS = [
  '#8979ff', // Solicitud de Naturalización
  '#ff928a', // Justificativo de Soltería
  '#3cc3df', // Justificativo de Concubinato
  '#ffae4c', // Invitación al país
  '#537ff1', // Justific. de Dependencia Económica / Pobreza
  '#6fd195', // Declaración Jurada de No Poseer
  '#8c63da', // Declaración Jurada de Ingresos
  '#2bb7dc', // Concubinato Postmórtem
  '#1f94ff', // Declaración Jurada
  '#f4cf3b', // Justificativo de Testigos
  '#55c4ae', // Color adicional
  '#6186cc', // Color adicional
];

// Helper para ceder el control al hilo principal con un respiro real para que el Spinner no se congele
const yieldToUI = (ms = 30) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Agrupa los datos por materia y subcategoría
 * Solo incluye categoría y subcategoría si tienen valores
 */
export function groupDataByMateriaSubcategoria(
  data: CasosGroupedData[]
): Record<string, CasosGroupedData[]> {
  const grouped: Record<string, CasosGroupedData[]> = {};

  for (const item of data) {
    const categoria = item.nombre_categoria?.trim() || '';
    const subcategoria = item.nombre_subcategoria?.trim() || '';

    const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría';
    const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría';

    let key = item.nombre_materia;
    if (hasCategoria && hasSubcategoria) {
      // Si hay ambas: "Materia - Categoría Subcategoría" (sin guión entre categoría y subcategoría)
      key += ` - ${categoria} ${subcategoria}`;
    } else if (hasCategoria) {
      // Si solo hay categoría: "Materia - Categoría"
      key += ` - ${categoria}`;
    } else if (hasSubcategoria) {
      // Si solo hay subcategoría: "Materia - Subcategoría"
      key += ` - ${subcategoria}`;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  }

  return grouped;
}

/**
 * Agrupa beneficiarios por materia y subcategoría (igual que tipos de caso)
 */
function groupBeneficiariosByMateriaSubcategoria(
  data: Array<{
    tipo_beneficiario: string;
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    nombre_materia: string;
    nombre_categoria: string;
    nombre_subcategoria: string;
    cantidad_beneficiarios: number;
  }>
): Record<string, typeof data> {
  const grouped: Record<string, typeof data> = {};

  for (const item of data) {
    const categoria = item.nombre_categoria?.trim() || '';
    const subcategoria = item.nombre_subcategoria?.trim() || '';

    const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría';
    const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría';

    let key = item.nombre_materia;
    if (hasCategoria && hasSubcategoria) {
      key += ` - ${categoria} ${subcategoria}`;
    } else if (hasCategoria) {
      key += ` - ${categoria}`;
    } else if (hasSubcategoria) {
      key += ` - ${subcategoria}`;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  }

  return grouped;
}

/**
 * Agrupa casos por materia y subcategoría (igual que beneficiarios)
 */
function groupCasosByMateriaSubcategoria(
  data: Array<{
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    nombre_materia: string;
    nombre_categoria: string;
    nombre_subcategoria: string;
    cantidad_casos: number;
  }>
): Record<string, typeof data> {
  const grouped: Record<string, typeof data> = {};

  for (const item of data) {
    const categoria = item.nombre_categoria?.trim() || '';
    const subcategoria = item.nombre_subcategoria?.trim() || '';

    const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría';
    const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría';

    let key = item.nombre_materia;
    if (hasCategoria && hasSubcategoria) {
      key += ` - ${categoria} ${subcategoria}`;
    } else if (hasCategoria) {
      key += ` - ${categoria}`;
    } else if (hasSubcategoria) {
      key += ` - ${subcategoria}`;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  }

  return grouped;
}

/**
 * Formatea el título del grupo (solo muestra categoría/subcategoría si existen)
 */
export function formatGroupTitle(item: {
  nombre_materia: string;
  nombre_categoria?: string | null;
  nombre_subcategoria?: string | null;
}): string {
  let title = item.nombre_materia;

  const categoria = item.nombre_categoria?.trim();
  const subcategoria = item.nombre_subcategoria?.trim();

  const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría';
  const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría';

  if (hasCategoria && hasSubcategoria) {
    // Si hay ambas: "Materia - Categoría Subcategoría" (sin guión entre categoría y subcategoría)
    title += ` - ${categoria} ${subcategoria}`;
  } else if (hasCategoria) {
    // Si solo hay categoría: "Materia - Categoría"
    title += ` - ${categoria}`;
  } else if (hasSubcategoria) {
    // Si solo hay subcategoría: "Materia - Subcategoría"
    title += ` - ${subcategoria}`;
  }

  return title;
}

/**
 * Genera una imagen de una página completa del reporte de Tipos de Caso
 */
export async function generateTiposCasosPageImage(
  groupData: CasosGroupedData[],
  title: string,
  logoBase64: string,
  isFirstPage: boolean
): Promise<string> {
  const pixelRatio = 2;
  const baseWidth = 842; // A4 Landscape en puntos
  const baseHeight = 595;

  const canvas = document.createElement('canvas');
  canvas.width = baseWidth * pixelRatio;
  canvas.height = baseHeight * pixelRatio;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(pixelRatio, pixelRatio);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  let currentY = 20;

  // 1. Dibujar Logo (solo primera página)
  if (isFirstPage && logoBase64) {
    const img = new Image();
    img.src = logoBase64;
    await new Promise(r => img.onload = r);
    ctx.drawImage(img, 20, 20, 200, 35);
    currentY = 70;
  }

  // 2. Dibujar Banner Rojo
  if (isFirstPage) {
    ctx.fillStyle = '#9c2327';
    const bannerWidth = baseWidth * 0.8;
    const bannerX = (baseWidth - bannerWidth) / 2;
    // Dibujar rectángulo con bordes redondeados manualmente para compatibilidad
    const r = 5;
    const x = bannerX;
    const y = currentY;
    const w = bannerWidth;
    const h = 40;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    // League Spartan no está disponible en canvas por defecto, usamos sans-serif como fallback
    ctx.font = 'bold 18px "League Spartan", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), baseWidth / 2, currentY + 25);
    currentY += 60;
  } else {
    currentY = 40;
  }

  // 3. Título de Sección (Materia - Categoría)
  ctx.fillStyle = '#000000';
  ctx.font = '600 18px "League Spartan", Arial, sans-serif';
  ctx.textAlign = 'center';
  const groupTitle = formatGroupTitle(groupData[0]);
  ctx.fillText(groupTitle, baseWidth / 2, currentY);
  currentY += 30;

  // 4. Generar y Dibujar la Gráfica
  const values = groupData.map(item => Number(item.cantidad_casos) || 0);
  const total = values.reduce((sum, val) => sum + val, 0);
  const labels = groupData.map(item => item.nombre_ambito_legal);
  const colors = CHART_COLORS.slice(0, groupData.length);

  const chartBase64 = generatePieChartImage(labels, values, colors, total);
  const chartImg = new Image();
  chartImg.src = chartBase64;
  await new Promise(r => chartImg.onload = r);

  // El gráfico donut generado ya tiene sus propias proporciones y callouts
  const chartWidth = 750;
  const chartHeight = 500;
  ctx.drawImage(chartImg, (baseWidth - chartWidth) / 2, currentY - 40, chartWidth, chartHeight);

  // 5. Dibujar Leyenda si es necesario (aunque el pie chart ya tiene sus propios callouts)
  // En el PDF original hay una leyenda abajo, vamos a replicarla mínimamente si hay espacio

  return canvas.toDataURL('image/png', 1.0);
}

// Colores fijos para los estatus
export const ESTATUS_COLORS: Record<string, string> = {
  'En proceso': '#4A90E2', // Azul
  'Archivado': '#7B68EE',   // Morado
  'Entregado': '#50C878',   // Verde
  'Asesoría': '#D2691E',    // Naranja/Marrón
};

/**
 * Genera una imagen base64 de un gráfico donut estilo iChart de Figma
 * Alta calidad con devicePixelRatio y renderizado optimizado
 */
export function generatePieChartImage(
  labels: string[],
  values: number[],
  colors: string[],
  total: number
): string {
  // Resolución optimizada (1.5x es el punto dulce entre calidad y fluidez de la UI)
  const pixelRatio = 2;
  // Aumentar el tamaño del canvas para que quepan todos los callouts
  const baseWidth = 750;
  const baseHeight = 500;

  const canvas = document.createElement('canvas');
  canvas.width = baseWidth * pixelRatio;
  canvas.height = baseHeight * pixelRatio;
  canvas.style.width = `${baseWidth}px`;
  canvas.style.height = `${baseHeight}px`;

  const ctx = canvas.getContext('2d', {
    alpha: true,
    desynchronized: false
  });

  if (!ctx) {
    return '';
  }

  // Escalar el contexto para alta resolución
  ctx.scale(pixelRatio, pixelRatio);

  // Configurar suavizado de alta calidad
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Configurar renderizado de texto de alta calidad
  // Usar coordenadas alineadas a píxeles para mejor renderizado

  // Centrar el donut con más margen para los callouts
  const centerX = baseWidth / 2;
  const centerY = baseHeight / 2;
  // Donut elíptico como en Figma (proporción ~1.43:1)
  const outerRadiusX = 200;
  const outerRadiusY = 140;
  const innerRadiusX = 90;
  const innerRadiusY = 63;
  const depth = 22;

  let currentAngle = -Math.PI / 2;
  const sliceAngles: {
    start: number;
    end: number;
    midAngle: number;
    value: number;
    color: string;
    percentage: string;
  }[] = [];

  // Calcular ángulos para cada segmento (sin separación, pegados)
  values.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const percentage = ((value / total) * 100).toFixed(2);
    sliceAngles.push({
      start: currentAngle,
      end: currentAngle + sliceAngle,
      midAngle: currentAngle + sliceAngle / 2,
      value,
      color: colors[index % colors.length],
      percentage
    });
    currentAngle += sliceAngle;
  });

  // Función auxiliar para dibujar un arco de elipse
  const drawEllipseArc = (cx: number, cy: number, rx: number, ry: number, startAngle: number, endAngle: number) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, startAngle, endAngle);
    ctx.lineTo(cx, cy);
    ctx.closePath();
  };

  // Dibujar efecto 3D (sombra inferior) - minimalista y sutil
  for (let d = depth; d > 0; d -= 2) {
    sliceAngles.forEach((slice) => {
      const darkness = 0.12 + (d / depth) * 0.2;
      drawEllipseArc(centerX, centerY + d, outerRadiusX, outerRadiusY, slice.start, slice.end);
      ctx.fillStyle = darkenColor(slice.color, darkness);
      ctx.fill();
    });
  }

  // Dibujar segmentos principales del donut (elipse) con textura plástica minimalista
  sliceAngles.forEach((slice) => {
    // Gradiente radial minimalista sin brillos
    const baseGradient = ctx.createRadialGradient(
      centerX - 25, centerY - 25, 0,
      centerX, centerY, outerRadiusX
    );
    baseGradient.addColorStop(0, lightenColor(slice.color, 0.15));
    baseGradient.addColorStop(0.6, slice.color);
    baseGradient.addColorStop(1, darkenColor(slice.color, 0.1));

    drawEllipseArc(centerX, centerY, outerRadiusX, outerRadiusY, slice.start, slice.end);
    ctx.fillStyle = baseGradient;
    ctx.fill();
  });

  // Dibujar el hueco interior (elipse)
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, innerRadiusX, innerRadiusY, 0, 0, 2 * Math.PI);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Dibujar líneas de guía y valores con cantidad y porcentaje
  sliceAngles.forEach((slice) => {
    const midAngle = slice.midAngle;

    // Punto de inicio en el borde de la elipse
    const startX = centerX + Math.cos(midAngle) * outerRadiusX;
    const startY = centerY + Math.sin(midAngle) * outerRadiusY;

    // Punto de inflexión - ajustar distancia según el ángulo (usando proporción elíptica)
    const bendDistance = 55;
    const bendX = centerX + Math.cos(midAngle) * (outerRadiusX + bendDistance);
    const bendY = centerY + Math.sin(midAngle) * (outerRadiusY + bendDistance * 0.7);

    // Dirección horizontal
    const direction = Math.cos(midAngle) > 0 ? 1 : -1;

    // Medir el ancho del texto para calcular la longitud de la línea
    ctx.font = '600 14px Inter, Arial, sans-serif';
    const valueText = slice.value.toString();
    const valueWidth = ctx.measureText(valueText).width;
    const percentageText = `${slice.percentage}%`;
    ctx.font = '400 12px Inter, Arial, sans-serif';
    const percentageWidth = ctx.measureText(percentageText).width;
    const maxTextWidth = Math.max(valueWidth, percentageWidth);

    // Calcular la longitud de la línea horizontal
    const horizontalLength = 70;
    const lineEndX = bendX + direction * horizontalLength;
    const lineY = bendY; // La línea horizontal está en bendY

    // Asegurar que el final de la línea esté dentro del canvas
    const textPadding = 8;
    const finalLineEndX = direction > 0
      ? Math.min(lineEndX, baseWidth - textPadding)
      : Math.max(lineEndX, textPadding);

    // Dibujar línea de guía con el color del segmento
    ctx.strokeStyle = slice.color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.setLineDash([]);

    // Línea diagonal
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(bendX, bendY);
    ctx.stroke();

    // Línea horizontal que se extiende hasta el final (actúa como separador)
    ctx.beginPath();
    ctx.moveTo(bendX, bendY);
    ctx.lineTo(finalLineEndX, lineY);
    ctx.stroke();

    // Valor numérico (cantidad) - Semi Bold 600, 14px (más grande) - ARRIBA de la línea
    // Alineado al final de la línea: derecha si direction > 0, izquierda si direction < 0
    ctx.fillStyle = slice.color;
    ctx.font = '600 14px Inter, Arial, sans-serif';
    ctx.textAlign = direction > 0 ? 'right' : 'left'; // Alineado al final de la línea
    ctx.textBaseline = 'bottom';
    // Alinear coordenadas a píxeles para mejor calidad
    const valueY = Math.round((lineY - 2) * pixelRatio) / pixelRatio;
    const valueX = Math.round(finalLineEndX * pixelRatio) / pixelRatio;
    ctx.fillText(valueText, valueX, valueY);

    // Porcentaje debajo de la línea - Regular 400, 12px (más grande)
    // Alineado al final de la línea: derecha si direction > 0, izquierda si direction < 0
    ctx.font = '400 12px Inter, Arial, sans-serif';
    ctx.textAlign = direction > 0 ? 'right' : 'left'; // Alineado al final de la línea
    ctx.textBaseline = 'top';
    // Alinear coordenadas a píxeles para mejor calidad
    const percentageY = Math.round((lineY + 2) * pixelRatio) / pixelRatio;
    const percentageX = Math.round(finalLineEndX * pixelRatio) / pixelRatio;
    ctx.fillText(percentageText, percentageX, percentageY);
  });

  // Total en el centro - Semi Bold 600, 32px, opacidad 0.9 (más grande para el donut más grande)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.font = '600 32px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Alinear coordenadas a píxeles para mejor calidad
  const totalX = Math.round(centerX * pixelRatio) / pixelRatio;
  const totalY = Math.round(centerY * pixelRatio) / pixelRatio;
  ctx.fillText(total.toString(), totalX, totalY);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Oscurece un color hexadecimal
 */
function darkenColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Aclara un color hexadecimal
 */
function lightenColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Convierte una imagen a base64 para preservar la transparencia
 */
export async function imageToBase64(imagePath: string): Promise<string> {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error al cargar imagen:', error);
    return imagePath; // Fallback a la ruta original
  }
}

/**
 * Genera y descarga un PDF con gráficas pie chart de tipos de casos
 */
export async function generateTiposCasosPDFReact(
  data: CasosGroupedData[],
  fechaInicio?: string,
  fechaFin?: string,
  term?: string
): Promise<void> {
  try {
    // Cargar el logo como base64 para preservar la transparencia
    const logoBase64 = await imageToBase64('/logo clinica juridica.png');

    // Agrupar datos
    const groupedData = groupDataByMateriaSubcategoria(data);

    // Generar imágenes de gráficas para cada grupo
    const chartImages: Record<string, string> = {};
    for (const [key, groupData] of Object.entries(groupedData)) {
      // Ceder control a la UI
      await yieldToUI();

      // Asegurar que los valores sean números
      const values = groupData.map(item => Number(item.cantidad_casos) || 0);
      const pieData = {
        labels: groupData.map(item => item.nombre_ambito_legal),
        values: values,
        colors: CHART_COLORS.slice(0, groupData.length),
      };
      // Calcular el total sumando los valores numéricos
      const total = values.reduce((sum, val) => sum + Number(val), 0);
      chartImages[key] = generatePieChartImage(pieData.labels, pieData.values, pieData.colors, total);
    }

    await new Promise(resolve => setTimeout(resolve, 0));

    // Generar el documento PDF
    const doc = React.createElement(TiposCasosPDF, { data, fechaInicio, fechaFin, chartImages, logoBase64 });

    // Crear el blob del PDF
    // @ts-ignore - React PDF types issue with React 19
    const blob = await pdf(doc).toBlob();

    // Crear URL y descargar
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tipos_de_Casos_${fechaInicio || 'all'}_${fechaFin || 'all'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw error;
  }
}

/**
 * Genera y descarga un PDF con gráfica donut 3D de estatus de casos
 * Usa el mismo estilo de pie chart que el reporte de tipos de casos
 */
export async function generateEstatusCasosPDFReact(
  data: EstatusGroupedData[],
  fechaInicio?: string,
  fechaFin?: string,
  term?: string
): Promise<void> {
  try {
    // Cargar el logo como base64 para preservar la transparencia
    const logoBase64 = await imageToBase64('/logo clinica juridica.png');

    // Preparar datos para el gráfico de pie chart 3D
    const values = data.map(item => Number(item.cantidad_casos) || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    const pieData = {
      labels: data.map(item => item.nombre_estatus),
      values: values,
      colors: data.map(item => ESTATUS_COLORS[item.nombre_estatus] || '#9E9E9E'),
    };

    // Generar imagen del pie chart 3D (mismo estilo que tipos de casos)
    const chartImage = generatePieChartImage(pieData.labels, pieData.values, pieData.colors, total);

    await yieldToUI();

    // Generar el documento PDF
    const doc = React.createElement(EstatusCasosPDF, {
      data,
      fechaInicio,
      fechaFin,
      chartImage,
      logoBase64,
      term
    });

    // Crear el blob del PDF
    // @ts-ignore - React PDF types issue with React 19
    const blob = await pdf(doc).toBlob();

    // Crear URL y descargar
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const periodLabel = term ? `Semestre_${term}` : `${fechaInicio || 'historico'}_${fechaFin || 'historico'}`;
    link.download = `Reporte_Estatus_Casos_${periodLabel}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al generar PDF de estatus:', error);
    throw error;
  }
}

/**
 * Genera y descarga un PDF con el informe resumen completo
 */
export async function generateInformeResumenPDFReact(
  data: InformeResumenData,
  fechaInicio?: string,
  fechaFin?: string,
  term?: string
): Promise<void> {
  try {
    // Cargar el logo y la portada como base64
    const logoBase64 = await imageToBase64('/logo clinica juridica.png');
    const portadaBase64 = await imageToBase64('/portada reporte.png');

    // Colores para gráficos
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
      casosPorAmbitoLegal?: string;
      estudiantesPorMateria?: Record<string, string>;
      profesoresPorMateria?: Record<string, string>;
      tiposDeCaso?: Record<string, string>;
      beneficiariosDirectos?: string;
      beneficiariosIndirectos?: string;
      beneficiariosPorParentesco?: string;
    } = {};

    // 1. PRIMERO: Tipos de Caso (pie charts agrupados, igual que el reporte de tipos de caso)
    if (data.tiposDeCaso && data.tiposDeCaso.length > 0) {
      // Usar la misma función groupDataByMateriaSubcategoria que usa generateTiposCasosPDFReact
      const groupedData = groupDataByMateriaSubcategoria(data.tiposDeCaso);

      // Generar imágenes de gráficas para cada grupo (igual que generateTiposCasosPDFReact)
      chartImages.tiposDeCaso = {};
      for (const [key, groupData] of Object.entries(groupedData)) {
        // Ceder control a la UI
        await yieldToUI();

        const values = groupData.map(item => Number(item.cantidad_casos) || 0);
        const pieData = {
          labels: groupData.map(item => item.nombre_ambito_legal),
          values: values,
          colors: CHART_COLORS.slice(0, groupData.length),
        };
        const total = values.reduce((sum, val) => sum + Number(val), 0);
        chartImages.tiposDeCaso[key] = generatePieChartImage(pieData.labels, pieData.values, pieData.colors, total);
      }
    }

    // 2. Casos por Materia (barras agrupadas por materia, categoría y subcategoría)
    if (data.casosPorMateria && data.casosPorMateria.length > 0) {
      await yieldToUI();

      // Agrupar por materia, categoría y subcategoría (igual que beneficiarios)
      const groupedCasos = groupCasosByMateriaSubcategoria(data.casosPorMateria);
      const labels: string[] = [];
      const values: number[] = [];

      for (const [key, groupData] of Object.entries(groupedCasos)) {
        // El key ya tiene el formato "Materia - Categoría Subcategoría"
        labels.push(key);
        // Sumar todas las cantidades del grupo
        const total = groupData.reduce((sum, item) => sum + Number(item.cantidad_casos || 0), 0);
        values.push(total);
      }

      const colors = BAR_COLORS.slice(0, labels.length);
      chartImages.casosPorMateria = generateBarChartImage(labels, values, colors);
    }

    // 3. Solicitantes por Género (barras)
    if (data.solicitantesPorGenero && data.solicitantesPorGenero.length > 0) {
      await yieldToUI();

      const labels = data.solicitantesPorGenero.map(item => item.genero === 'M' ? 'Masculino' : 'Femenino');
      const values = data.solicitantesPorGenero.map(item => item.cantidad_solicitantes);
      const colors = BAR_COLORS.slice(0, labels.length);
      chartImages.solicitantesPorGenero = generateBarChartImage(labels, values, colors);
    }

    // 3.5. Solicitantes por Estado (barras)
    if (data.solicitantesPorEstado && data.solicitantesPorEstado.length > 0) {
      await yieldToUI();

      const labels = data.solicitantesPorEstado.map(item => item.nombre_estado);
      const values = data.solicitantesPorEstado.map(item => item.cantidad_solicitantes);
      const colors = BAR_COLORS.slice(0, labels.length);
      chartImages.solicitantesPorEstado = generateBarChartImage(labels, values, colors);
    }

    // 4. Solicitantes por Parroquia (barras)
    if (data.solicitantesPorParroquia && data.solicitantesPorParroquia.length > 0) {
      await yieldToUI();

      const labels = data.solicitantesPorParroquia.map(item => item.nombre_parroquia);
      const values = data.solicitantesPorParroquia.map(item => item.cantidad_solicitantes);
      const colors = BAR_COLORS.slice(0, labels.length);
      chartImages.solicitantesPorParroquia = generateBarChartImage(labels, values, colors);
    }

    // 5. Estudiantes por Materia (un solo diagrama de barras con todas las materias)
    if (data.estudiantesPorMateria && data.estudiantesPorMateria.length > 0) {
      await yieldToUI();

      // Agrupar solo por materia (sumando todos los estudiantes de cada materia)
      const groupedByMateria: Record<string, number> = {};
      for (const item of data.estudiantesPorMateria) {
        const materia = item.nombre_materia;
        if (!groupedByMateria[materia]) {
          groupedByMateria[materia] = 0;
        }
        groupedByMateria[materia] += item.cantidad_estudiantes;
      }

      // Crear un solo diagrama de barras con todas las materias
      const labels = Object.keys(groupedByMateria);
      const values = Object.values(groupedByMateria).map(v => Number(v));
      const colors = BAR_COLORS.slice(0, labels.length);
      chartImages.estudiantesPorMateria = {
        total: generateBarChartImage(labels, values, colors)
      };
    }

    // 6. Profesores por Materia (un solo diagrama de barras con todas las materias)
    if (data.profesoresPorMateria && data.profesoresPorMateria.length > 0) {
      await yieldToUI();

      // Agrupar solo por materia (sumando todos los profesores de cada materia)
      const groupedByMateria: Record<string, number> = {};
      for (const item of data.profesoresPorMateria) {
        const materia = item.nombre_materia;
        if (!groupedByMateria[materia]) {
          groupedByMateria[materia] = 0;
        }
        groupedByMateria[materia] += item.cantidad_profesores;
      }

      // Crear un solo diagrama de barras con todas las materias
      const labels = Object.keys(groupedByMateria);
      const values = Object.values(groupedByMateria).map(v => Number(v));
      const colors = BAR_COLORS.slice(0, labels.length);
      chartImages.profesoresPorMateria = {
        total: generateBarChartImage(labels, values, colors)
      };
    }

    // 7. Beneficiarios Directos (un solo diagrama de barras con todas las combinaciones materia-categoría-subcategoría)
    if (data.beneficiariosPorTipo && data.beneficiariosPorTipo.length > 0) {
      await yieldToUI();

      const directos = data.beneficiariosPorTipo.filter(item => item.tipo_beneficiario === 'Directo');
      if (directos.length > 0) {
        // Agrupar por materia, categoría y subcategoría y sumar cantidades
        const groupedDirectos = groupBeneficiariosByMateriaSubcategoria(directos);
        const labels: string[] = [];
        const values: number[] = [];

        for (const [key, groupData] of Object.entries(groupedDirectos)) {
          // El key ya tiene el formato "Materia - Categoría Subcategoría"
          labels.push(key);
          // Sumar todas las cantidades del grupo
          const total = groupData.reduce((sum, item) => sum + Number(item.cantidad_beneficiarios || 0), 0);
          values.push(total);
        }

        const colors = BAR_COLORS.slice(0, labels.length);
        chartImages.beneficiariosDirectos = generateBarChartImage(labels, values, colors);
      }
    }

    // 8. Beneficiarios Indirectos (un solo diagrama de barras con todas las combinaciones materia-categoría-subcategoría)
    if (data.beneficiariosPorTipo && data.beneficiariosPorTipo.length > 0) {
      await yieldToUI();

      const indirectos = data.beneficiariosPorTipo.filter(item => item.tipo_beneficiario === 'Indirecto');
      if (indirectos.length > 0) {
        // Agrupar por materia, categoría y subcategoría y sumar cantidades
        const groupedIndirectos = groupBeneficiariosByMateriaSubcategoria(indirectos);
        const labels: string[] = [];
        const values: number[] = [];

        for (const [key, groupData] of Object.entries(groupedIndirectos)) {
          // El key ya tiene el formato "Materia - Categoría Subcategoría"
          labels.push(key);
          // Sumar todas las cantidades del grupo
          const total = groupData.reduce((sum, item) => sum + Number(item.cantidad_beneficiarios || 0), 0);
          values.push(total);
        }

        const colors = BAR_COLORS.slice(0, labels.length);
        chartImages.beneficiariosIndirectos = generateBarChartImage(labels, values, colors);
      }
    }

    // 9. Beneficiarios por Parentesco
    if (data.beneficiariosPorParentesco && data.beneficiariosPorParentesco.length > 0) {
      await yieldToUI();

      const labels = data.beneficiariosPorParentesco.map(item => item.parentesco);
      const values = data.beneficiariosPorParentesco.map(item => Number(item.cantidad_beneficiarios));
      const colors = BAR_COLORS.slice(0, labels.length);
      chartImages.beneficiariosPorParentesco = generateBarChartImage(labels, values, colors);
    }

    await yieldToUI(100);

    // Generar el documento PDF
    const doc = React.createElement(InformeResumenPDF, {
      data,
      fechaInicio,
      fechaFin,
      chartImages,
      logoBase64,
      portadaBase64,
      term
    });

    // Un respiro final antes del paso más pesado (maquetación del PDF)
    await yieldToUI(100);

    // Crear el blob del PDF
    // @ts-ignore - React PDF types issue with React 19
    const blob = await pdf(doc).toBlob();

    // Crear URL y descargar
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const periodLabel = term ? `Semestre_${term}` : `${fechaInicio || 'historico'}_${fechaFin || 'historico'}`;
    link.download = `Informe_Resumen_${periodLabel}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al generar PDF del informe resumen:', error);
    throw error;
  }
}
