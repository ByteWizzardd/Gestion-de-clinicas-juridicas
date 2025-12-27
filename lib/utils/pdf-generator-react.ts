'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer/lib/react-pdf.browser';
import { TiposCasosPDF } from '@/components/reports/TiposCasosPDF';
import { EstatusCasosPDF, EstatusGroupedData } from '@/components/reports/EstatusCasosPDF';
import { CasosGroupedData } from '@/app/actions/reports';

// Colores exactos del diseño de Figma
const CHART_COLORS = [
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

/**
 * Agrupa los datos por materia y subcategoría
 * Solo incluye categoría y subcategoría si tienen valores
 */
function groupDataByMateriaSubcategoria(
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

// Colores fijos para los estatus
const ESTATUS_COLORS: Record<string, string> = {
  'En proceso': '#4A90E2', // Azul
  'Archivado': '#7B68EE',   // Morado
  'Entregado': '#50C878',   // Verde
  'Asesoría': '#D2691E',    // Naranja/Marrón
};

/**
 * Genera una imagen base64 de un gráfico de barras estilo Figma
 * Barras planas con overlay blanco en la mitad izquierda
 * Alta calidad con devicePixelRatio y renderizado optimizado
 */
function generateBarChartImage(
  labels: string[],
  values: number[],
  colors: string[]
): string {
  // Usar alta resolución para mejor calidad del texto
  const pixelRatio = 4;
  const baseWidth = 1353;
  const baseHeight = 581;
  
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
  
  // Configuración del gráfico según Figma
  const padding = { top: 30, right: 20, bottom: 50, left: 20 };
  const chartWidth = baseWidth - padding.left - padding.right;
  const chartHeight = baseHeight - padding.top - padding.bottom;
  const barSpacing = chartWidth / labels.length;
  const barWidth = barSpacing * 0.68; // ~232px de 338px según Figma
  const maxValue = Math.max(...values, 1);
  const gridLines = 10;
  
  const baseY = padding.top + chartHeight;
  
  // Dibujar líneas de grid horizontales (según Figma: 10-11 líneas con opacidad 0.15)
  ctx.strokeStyle = 'rgba(0, 0, 26, 0.15)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartHeight / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
  }
  
  // Dibujar línea base más oscura (opacidad 0.3 según Figma)
  ctx.strokeStyle = 'rgba(0, 0, 26, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, baseY);
  ctx.lineTo(padding.left + chartWidth, baseY);
  ctx.stroke();
  
  // Dibujar barras (sin efecto 3D, solo barras planas con overlay)
  labels.forEach((label, index) => {
    const value = values[index];
    if (value <= 0) return;
    
    const color = colors[index % colors.length];
    const barHeight = (value / maxValue) * chartHeight;
    const x = padding.left + barSpacing * index + (barSpacing - barWidth) / 2;
    const y = baseY - barHeight;
    
    // Dibujar barra principal (color sólido)
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Overlay blanco en la mitad izquierda (opacidad 0.3 según Figma)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x, y, barWidth / 2, barHeight);
    
    // Etiqueta de valor encima de la barra (opacidad 0.7 según Figma)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '400 16px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const labelY = Math.round((y - 8) * pixelRatio) / pixelRatio;
    const labelX = Math.round((x + barWidth / 2) * pixelRatio) / pixelRatio;
    ctx.fillText(value.toString(), labelX, labelY);
    
    // Etiqueta del eje X (nombre del estatus, opacidad 0.7 según Figma)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '400 12px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelXPos = Math.round((x + barWidth / 2) * pixelRatio) / pixelRatio;
    const labelYPos = Math.round((baseY + 8) * pixelRatio) / pixelRatio;
    ctx.fillText(label, labelXPos, labelYPos);
  });
  
  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Genera una imagen base64 de un gráfico donut estilo iChart de Figma
 * Alta calidad con devicePixelRatio y renderizado optimizado
 */
function generatePieChartImage(
  labels: string[],
  values: number[],
  colors: string[],
  total: number
): string {
  // Usar alta resolución para mejor calidad del texto
  const pixelRatio = 4; // 4x para máxima calidad en PDF, especialmente para texto
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
async function imageToBase64(imagePath: string): Promise<string> {
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
  fechaFin?: string
): Promise<void> {
  try {
    // Cargar el logo como base64 para preservar la transparencia
    const logoBase64 = await imageToBase64('/logo clinica juridica.png');
    
    // Agrupar datos
    const groupedData = groupDataByMateriaSubcategoria(data);
    
    // Generar imágenes de gráficas para cada grupo
    const chartImages: Record<string, string> = {};
    for (const [key, groupData] of Object.entries(groupedData)) {
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
 * Genera y descarga un PDF con gráfica donut de estatus de casos
 */
export async function generateEstatusCasosPDFReact(
  data: EstatusGroupedData[],
  fechaInicio?: string,
  fechaFin?: string
): Promise<void> {
  try {
    // Cargar el logo como base64 para preservar la transparencia
    const logoBase64 = await imageToBase64('/logo clinica juridica.png');
    
    // Colores fijos para los estatus
    const ESTATUS_COLORS: Record<string, string> = {
      'En proceso': '#4A90E2',
      'Archivado': '#7B68EE',
      'Entregado': '#50C878',
      'Asesoría': '#D2691E',
    };
    
    // Preparar datos para el gráfico
    const values = data.map(item => Number(item.cantidad_casos) || 0);
    const barData = {
      labels: data.map(item => item.nombre_estatus),
      values: values,
      colors: data.map(item => ESTATUS_COLORS[item.nombre_estatus] || '#9E9E9E'),
    };
    
    // Generar imagen del gráfico de barras
    const chartImage = generateBarChartImage(barData.labels, barData.values, barData.colors);
    
    // Generar el documento PDF
    const doc = React.createElement(EstatusCasosPDF, { 
      data, 
      fechaInicio, 
      fechaFin, 
      chartImage, 
      logoBase64 
    });
    
    // Crear el blob del PDF
    // @ts-ignore - React PDF types issue with React 19
    const blob = await pdf(doc).toBlob();
    
    // Crear URL y descargar
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Estatus_de_Casos_${fechaInicio || 'all'}_${fechaFin || 'all'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al generar PDF de estatus:', error);
    throw error;
  }
}
