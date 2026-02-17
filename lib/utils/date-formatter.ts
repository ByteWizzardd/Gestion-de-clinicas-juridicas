/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Calculates the age based on a birth date.
 * @param birthDate The birth date as a Date object or string.
 * @returns The calculated age in years.
 */
export function calculateAge(birthDate: Date | string): number {
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
export function formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-VE'); // Use Venezuelan locale or default
}

/**
 * Formats a date to include time (e.g., "DD/MM/YYYY hh:mm a").
 * @param date The date to format.
 * @returns The formatted date and time string.
 */
export function formatDateTime(date: Date | string): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return new Intl.DateTimeFormat('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(d);
}
