/**
 * Utilidades generales para la generación de documentos Word (.docx)
 */

import { PageOrientation } from 'docx';

/**
 * Crea una sección de página vacía vertical con márgenes estándar de Word
 */
export function createEmptyPortraitPage() {
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
 * Formatea una fecha a DD/MM/YYYY
 */
export function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    // Parsear directamente el string ISO (YYYY-MM-DD) para evitar el problema de zona horaria:
    // new Date('YYYY-MM-DD') interpreta como medianoche UTC, y getDate() en UTC-4 retrocede un día.
    if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    }
    // Fallback para otros formatos
    const date = new Date(dateStr);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Convierte una cadena base64 en un Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

