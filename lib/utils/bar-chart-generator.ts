'use client';

/**
 * Generador de gráficos de barras estilo Figma
 * 
 * Este archivo contiene la función para generar gráficos de barras con el estilo
 * específico de Figma: barras planas con overlay blanco en la mitad izquierda,
 * líneas de grid horizontales, y etiquetas de valor/nombre.
 * 
 * NOTA: Este archivo se mantiene como referencia para futuros usos.
 * Actualmente el reporte de estatus usa pie chart 3D.
 */

/**
 * Genera una imagen base64 de un gráfico de barras estilo Figma
 * Barras planas con overlay blanco en la mitad izquierda
 * Alta calidad con devicePixelRatio y renderizado optimizado
 */
export function generateBarChartImage(
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
  
  const baseY = padding.top + chartHeight;
  
  // Solo dibujar línea base (sin líneas de grid horizontales)
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
    // Convertir a número entero para evitar padding de ceros
    const valueText = Math.round(Number(value)).toString();
    ctx.fillText(valueText, labelX, labelY);
    
    // Etiqueta del eje X (nombre del estatus, opacidad 0.7 según Figma)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '400 14px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelXPos = Math.round((x + barWidth / 2) * pixelRatio) / pixelRatio;
    const labelYPos = Math.round((baseY + 8) * pixelRatio) / pixelRatio;
    ctx.fillText(label, labelXPos, labelYPos);
  });
  
  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Ejemplo de uso:
 * 
 * const labels = ['En proceso', 'Archivado', 'Entregado', 'Asesoría'];
 * const values = [15, 8, 12, 6];
 * const colors = ['#4A90E2', '#7B68EE', '#50C878', '#D2691E'];
 * 
 * const chartImage = generateBarChartImage(labels, values, colors);
 * // chartImage es una URL base64 que puede usarse en <img src={chartImage} />
 */

