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
  // Usar resolución 2x para consistencia con el generador de pie charts
  const pixelRatio = 2;
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
  // Aumentar padding superior e inferior para acomodar etiquetas apiladas
  const padding = { top: 45, right: 20, bottom: 70, left: 20 };
  const chartWidth = baseWidth - padding.left - padding.right;
  const chartHeight = baseHeight - padding.top - padding.bottom;
  const barSpacing = chartWidth / labels.length;
  const barWidth = barSpacing * 0.68; // ~232px de 338px según Figma
  const maxValue = Math.max(...values.map(v => Number(v)), 1);
  const total = values.reduce((acc, val) => acc + Number(val), 0);

  const baseY = padding.top + chartHeight;

  // Asegurar que values sean números para el resto de la función
  const numericValues = values.map(v => Number(v));

  // Función para dividir texto en múltiples líneas
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  // Solo dibujar línea base (sin líneas de grid horizontales)
  ctx.strokeStyle = 'rgba(0, 0, 26, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, baseY);
  ctx.lineTo(padding.left + chartWidth, baseY);
  ctx.stroke();

  // Dibujar barras (sin efecto 3D, solo barras planas con overlay)
  labels.forEach((label, index) => {
    const value = numericValues[index];
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

    // Etiqueta de valor encima de la barra (Cantidad y Porcentaje apilados)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const labelX = Math.round((x + barWidth / 2) * pixelRatio) / pixelRatio;
    const labelY = Math.round((y - 8) * pixelRatio) / pixelRatio;

    // Calcular porcentaje con 2 decimales
    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";

    // 1. Dibujar Porcentaje (abajo, más pequeño)
    ctx.font = '400 12px Inter, Arial, sans-serif';
    ctx.fillText(`(${percentage}%)`, labelX, labelY);

    // 2. Dibujar Cantidad (arriba, más grande y negrita)
    ctx.font = '600 16px Inter, Arial, sans-serif';
    ctx.fillText(Math.round(Number(value)).toString(), labelX, labelY - 15);

    // Etiqueta del eje X (con saltos de línea para evitar que se crucen)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '400 14px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelXPos = Math.round((x + barWidth / 2) * pixelRatio) / pixelRatio;
    const labelYPos = Math.round((baseY + 8) * pixelRatio) / pixelRatio;

    // Dividir el texto en múltiples líneas si es necesario
    const maxLabelWidth = barWidth * 0.9; // 90% del ancho de la barra
    const wrappedLines = wrapText(ctx, label, maxLabelWidth);
    const lineHeight = 16; // Altura de cada línea

    // Dibujar cada línea del texto
    wrappedLines.forEach((line, lineIndex) => {
      const y = labelYPos + (lineIndex * lineHeight);
      ctx.fillText(line, labelXPos, y);
    });
  });

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Genera una imagen base64 de un gráfico de barras horizontales agrupadas estilo Figma
 * Se usa para agrupar servicios básicos (Agua, Aseo, etc.) en una sola gráfica.
 */
export function generateGroupedHorizontalBarChartImage(
  groups: Array<{ title: string; items: Array<{ label: string; value: number }> }>,
  colors: string[]
): string {
  const pixelRatio = 2;
  const baseWidth = 1353;
  const baseHeight = 1000; // Aumentar altura para llenar más espacio

  const canvas = document.createElement('canvas');
  canvas.width = baseWidth * pixelRatio;
  canvas.height = baseHeight * pixelRatio;
  canvas.style.width = `${baseWidth}px`;
  canvas.style.height = `${baseHeight}px`;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return '';

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const padding = { top: 40, right: 150, bottom: 40, left: 300 };
  const chartWidth = baseWidth - padding.left - padding.right;
  const chartHeight = baseHeight - padding.top - padding.bottom;

  // Calcular espacio total
  const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
  const sectionSpacing = 60; // Más espacio entre secciones
  const availableHeight = chartHeight - (groups.length * 40) - ((groups.length - 1) * sectionSpacing);
  const barHeight = 25;
  const itemHeight = 45;

  let currentY = padding.top;
  const maxValue = Math.max(...groups.flatMap(g => g.items.map(i => i.value)), 1);

  groups.forEach((group, groupIndex) => {
    // Dibujar título del grupo ENFOCADO (arriba de las barras)
    ctx.fillStyle = '#9c2327';
    ctx.font = 'bold 20px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(group.title.toUpperCase(), padding.left - 280, currentY);

    // Línea decorativa bajo el título
    ctx.strokeStyle = '#9c2327';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left - 280, currentY + 28);
    ctx.lineTo(padding.left - 100, currentY + 28);
    ctx.stroke();

    currentY += 50;

    // Línea base vertical para este grupo
    ctx.strokeStyle = 'rgba(0, 0, 26, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, currentY - 10);
    ctx.lineTo(padding.left, currentY + (group.items.length * itemHeight) - 10);
    ctx.stroke();

    const groupTotal = group.items.reduce((acc, i) => acc + Number(i.value), 0);

    group.items.forEach((item, itemIndex) => {
      const value = Number(item.value);
      const color = colors[itemIndex % colors.length];
      const barWidth = (value / maxValue) * chartWidth;

      const x = padding.left;
      const y = currentY + (itemHeight - barHeight) / 2;

      // Barra
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x, y, barWidth, barHeight / 2);

      // Etiqueta de la opción (Izquierda)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = '500 16px Inter, Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, padding.left - 20, y + barHeight / 2);

      // Valor y Porcentaje (Derecha de la barra)
      const percentage = groupTotal > 0 ? ((value / groupTotal) * 100).toFixed(1) : "0.0";
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.font = 'bold 16px Inter, Arial, sans-serif';
      ctx.fillText(value.toString(), x + barWidth + 15, y + barHeight / 2);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = '400 14px Inter, Arial, sans-serif';
      ctx.fillText(`(${percentage}%)`, x + barWidth + ctx.measureText(value.toString()).width + 25, y + barHeight / 2);

      currentY += itemHeight;
    });

    currentY += sectionSpacing;
  });

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Genera una imagen base64 de un gráfico de barras horizontales estilo Figma
 * Barras horizontales con overlay blanco en la mitad superior
 * Eje Y: Etiquetas, Eje X: Valores
 */
export function generateHorizontalBarChartImage(
  labels: string[],
  values: number[],
  colors: string[]
): string {
  const pixelRatio = 2;
  const baseWidth = 1353;
  const baseHeight = 581;

  const canvas = document.createElement('canvas');
  canvas.width = baseWidth * pixelRatio;
  canvas.height = baseHeight * pixelRatio;
  canvas.style.width = `${baseWidth}px`;
  canvas.style.height = `${baseHeight}px`;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return '';

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Padding adaptado para etiquetas horizontales a la izquierda
  const padding = { top: 40, right: 100, bottom: 40, left: 250 };
  const chartWidth = baseWidth - padding.left - padding.right;
  const chartHeight = baseHeight - padding.top - padding.bottom;

  const barSpacing = chartHeight / labels.length;
  const barHeight = barSpacing * 0.7;
  const maxValue = Math.max(...values.map(v => Number(v)), 1);
  const total = values.reduce((acc, val) => acc + Number(val), 0);

  const numericValues = values.map(v => Number(v));

  // Línea base vertical (Eje Y)
  ctx.strokeStyle = 'rgba(0, 0, 26, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.stroke();

  labels.forEach((label, index) => {
    const value = numericValues[index];
    const color = colors[index % colors.length];
    const barWidth = (value / maxValue) * chartWidth;

    const x = padding.left;
    const y = padding.top + barSpacing * index + (barSpacing - barHeight) / 2;

    // Dibujar barra principal
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Overlay blanco en la mitad superior de la barra horizontal
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x, y, barWidth, barHeight / 2);

    // Etiquetas de la categoría a la izquierda (Eje Y)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = '400 16px Inter, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, padding.left - 15, y + barHeight / 2);

    // Valores a la derecha de la barra (Cantidad y %)
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Cantidad (Negrita)
    ctx.font = '600 16px Inter, Arial, sans-serif';
    ctx.fillText(`${Math.round(value)}`, x + barWidth + 10, y + barHeight / 2 - 8);

    // Porcentaje
    ctx.font = '400 14px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillText(`(${percentage}%)`, x + barWidth + 10, y + barHeight / 2 + 10);
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

