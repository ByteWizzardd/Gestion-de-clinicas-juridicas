import type ExcelJS from 'exceljs';
import { getExportStamp } from './export-timestamp';

interface ExportStampCell {
    /** Fila donde se escribe la marca (1-indexada). */
    row: number;
    /** Primera columna del rango combinado (1-indexada). */
    fromCol: number;
    /** Última columna del rango combinado (1-indexada). */
    toCol: number;
}

/**
 * Estampa la fecha y hora de exportación en la esquina superior derecha de una
 * hoja de cálculo.
 *
 * Lo hace por dos vías complementarias:
 *  - `cell`: una celda visible en pantalla, arriba a la derecha del formato.
 *  - encabezado de impresión: Excel lo repite en la esquina superior derecha
 *    de cada página impresa o exportada a PDF.
 */
export function applyExcelExportStamp(
    sheet: ExcelJS.Worksheet,
    options: { exportedAt?: Date; cell?: ExportStampCell } = {}
): void {
    const stamp = getExportStamp(options.exportedAt);

    // &R = alineado a la derecha, &"Arial" = fuente, &8 = 8 pt, &K = color
    sheet.headerFooter.oddHeader = `&R&"Arial"&8&K8A8A8A${stamp}`;
    sheet.headerFooter.evenHeader = sheet.headerFooter.oddHeader;

    if (!options.cell) return;

    const { row, fromCol, toCol } = options.cell;
    sheet.mergeCells(row, fromCol, row, toCol);
    const cell = sheet.getCell(row, fromCol);
    cell.value = stamp;
    cell.font = { name: 'Arial', size: 7, italic: true, color: { argb: 'FF8A8A8A' } };
    cell.alignment = { horizontal: 'right', vertical: 'middle' };
}
