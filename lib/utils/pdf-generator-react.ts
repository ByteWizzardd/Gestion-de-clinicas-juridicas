'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer/lib/react-pdf.browser';
import { TiposCasosPDF } from '@/components/reports/TiposCasosPDF';
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
    
    let key = item.nombre_materia;
    if (categoria) {
      key += ` - ${categoria}`;
    }
    if (subcategoria) {
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
 * Genera una imagen base64 de un gráfico donut con efecto 3D
 * Diseño exacto basado en la imagen de referencia
 */
function generatePieChartImage(
  labels: string[],
  values: number[],
  colors: string[],
  total: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 550;
  canvas.height = 350;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return '';
  }

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 - 10;
  const outerRadius = 140;
  const innerRadius = 65;
  const depth = 15; // Profundidad del efecto 3D

  let currentAngle = -Math.PI / 2;
  const sliceAngles: { start: number; end: number; midAngle: number; value: number; color: string }[] = [];

  // Calcular ángulos para cada segmento
  values.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    sliceAngles.push({
      start: currentAngle,
      end: currentAngle + sliceAngle,
      midAngle: currentAngle + sliceAngle / 2,
      value,
      color: colors[index % colors.length]
    });
    currentAngle += sliceAngle;
  });

  // Dibujar efecto 3D (capas inferiores)
  for (let d = depth; d > 0; d -= 2) {
    sliceAngles.forEach((slice) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + d);
      ctx.arc(centerX, centerY + d, outerRadius, slice.start, slice.end);
      ctx.lineTo(centerX, centerY + d);
      ctx.closePath();
      
      // Color más oscuro para el efecto 3D
      ctx.fillStyle = darkenColor(slice.color, 0.3 + (d / depth) * 0.2);
      ctx.fill();
    });
  }

  // Dibujar segmentos principales del donut
  sliceAngles.forEach((slice, index) => {
    // Gradiente para efecto de brillo
    const gradient = ctx.createRadialGradient(
      centerX - 25, centerY - 25, 0,
      centerX, centerY, outerRadius
    );
    gradient.addColorStop(0, lightenColor(slice.color, 0.3));
    gradient.addColorStop(0.5, slice.color);
    gradient.addColorStop(1, darkenColor(slice.color, 0.1));

    // Segmento exterior
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, outerRadius, slice.start, slice.end);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Borde blanco
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Dibujar el hueco interior (para hacer el donut)
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Sombra interior sutil
  const innerGradient = ctx.createRadialGradient(
    centerX, centerY, innerRadius - 20,
    centerX, centerY, innerRadius
  );
  innerGradient.addColorStop(0, 'rgba(0,0,0,0)');
  innerGradient.addColorStop(1, 'rgba(0,0,0,0.05)');
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.fillStyle = innerGradient;
  ctx.fill();

  // Dibujar líneas de guía y valores
  sliceAngles.forEach((slice) => {
    const midAngle = slice.midAngle;
    
    // Punto de inicio en el borde del donut
    const startX = centerX + Math.cos(midAngle) * outerRadius;
    const startY = centerY + Math.sin(midAngle) * outerRadius;
    
    // Punto medio (primera parte de la línea)
    const midX = centerX + Math.cos(midAngle) * (outerRadius + 25);
    const midY = centerY + Math.sin(midAngle) * (outerRadius + 25);
    
    // Punto final (línea horizontal)
    const direction = Math.cos(midAngle) > 0 ? 1 : -1;
    const endX = midX + direction * 25;
    const endY = midY;
    
    // Dibujar línea de guía (dos segmentos)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    
    // Primera parte: diagonal desde el donut
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(midX, midY);
    ctx.stroke();
    
    // Segunda parte: horizontal
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Valor numérico al final (color del segmento, tamaño 10, Semi Bold)
    ctx.fillStyle = slice.color;
    ctx.font = '600 10px Inter, Arial'; // Semi Bold
    ctx.textAlign = direction > 0 ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(slice.value.toString(), endX + direction * 5, endY);
  });

  // Total en el centro (opacidad 0.9, tamaño 18, Semi Bold)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.font = '600 18px Inter, Arial'; // Semi Bold
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total.toString(), centerX, centerY);

  return canvas.toDataURL('image/png');
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
