/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Calculates the age based on a birth date.
 * @param birthDate The birth date as a Date object or string.
 * @returns The calculated age in years.
 */
export function calculateAge(birthDate: Date | string | null | undefined): number {
    if (!birthDate) return 0;

    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Formats a date to a readable string (e.g., "DD/MM/YYYY").
 * @param date The date to format.
 * @returns The formatted date string.
 */
export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';

    if (typeof date === 'string') {
        const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            return `${match[3]}/${match[2]}/${match[1]}`;
        }
    }

    const d = new Date(date);
    return d.toLocaleDateString('es-VE'); // Use Venezuelan locale or default
}

/**
 * Formats a date to include time (e.g., "DD/MM/YYYY, hh:mm a. m.").
 * Parses the date string manually to avoid timezone conversion issues.
 * Server timestamps are already in America/Caracas timezone.
 * @param date The date to format.
 * @param _options Optional (kept for backward compatibility, ignored).
 * @returns The formatted date and time string.
 */
export function formatDateTime(date: Date | string | null | undefined, _options?: Intl.DateTimeFormatOptions): string {
    if (!date) return '';

    let dateStr = typeof date === 'string' ? date : date.toISOString();
    // Normalizar: reemplazar espacio por T
    dateStr = dateStr.replace(' ', 'T');

    // Intentar parsear con hora
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
        const day = match[3];
        const month = match[2];
        const year = match[1];
        let hour = parseInt(match[4], 10);
        const minute = match[5];

        const ampm = hour >= 12 ? 'p.\u00a0m.' : 'a.\u00a0m.';
        let displayHour = hour % 12;
        displayHour = displayHour || 12;

        return `${day}/${month}/${year}, ${displayHour.toString().padStart(2, '0')}:${minute} ${ampm}`;
    }

    // Solo fecha sin hora
    const dateOnlyMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnlyMatch) {
        return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
    }

    return '';
}

/**
 * Fecha 'YYYY-MM-DD' en la zona horaria del navegador/servidor.
 * No usar toISOString().slice(0, 10): da la fecha UTC, que en Venezuela
 * (UTC-4) ya es el día siguiente a partir de las 8 p. m.
 */
export function toLocalISODate(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Date a medianoche LOCAL de una fecha 'YYYY-MM-DD' (inversa de toLocalISODate).
 * new Date('YYYY-MM-DD') la interpreta en UTC: en Venezuela queda en el día
 * anterior a las 8 p. m. y getDate()/setHours() devuelven el día equivocado.
 */
export function parseLocalISODate(value: string): Date {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Formatea la fecha y hora actual para usar en nombres de archivos.
 * Formato: DD-MM-YYYY_HH-mm
 */
export function formatDateTimeForFilename(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hoursNum = now.getHours();
    const ampm = hoursNum >= 12 ? 'pm' : 'am';
    hoursNum = hoursNum % 12;
    hoursNum = hoursNum ? hoursNum : 12; // la hora '0' debe ser '12'
    const hours = String(hoursNum).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year}_${hours}.${minutes}${ampm}`;
}


