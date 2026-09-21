/**
 * Marca de exportación: fecha y hora en que se generó un reporte.
 *
 * Se estampa en la esquina superior derecha de cada página de los reportes
 * (PDF, Word y Excel) para dejar constancia de cuándo se exportó el archivo.
 */

/**
 * Formatea una fecha como "DD/MM/YYYY, hh:mm a. m.".
 * Usa la hora local del equipo que genera el reporte (la exportación ocurre en
 * el navegador), con la misma convención de formatDateTime.
 */
export function formatExportDateTime(date: Date = new Date()): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const hours24 = date.getHours();
    const ampm = hours24 >= 12 ? 'p.\u00a0m.' : 'a.\u00a0m.';
    const hours = String(hours24 % 12 || 12).padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
}

/**
 * Texto completo de la marca: "Exportado: DD/MM/YYYY, hh:mm a. m."
 */
export function getExportStamp(date: Date = new Date()): string {
    return `Exportado: ${formatExportDateTime(date)}`;
}
