/**
 * Utilidad para formatear títulos a Title Case en español.
 * Las palabras principales inician con mayúscula, mientras que los conectivos
 * (preposiciones, artículos, conjunciones) se mantienen en minúscula,
 * a menos que sean la primera palabra del título.
 */

const CONECTIVOS_MINUSCULAS = new Set([
    'a', 'ante', 'bajo', 'cabe', 'con', 'contra', 'de', 'del', 'desde', 'durante',
    'en', 'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 'según', 'sin',
    'so', 'sobre', 'tras', 'versus', 'vía', 'y', 'e', 'ni', 'que', 'o', 'u',
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'
]);

/**
 * Convierte un texto o título a Title Case respetando conectivos en minúscula.
 * 
 * Ejemplo:
 * - "tipo de vivienda" -> "Tipo de Vivienda"
 * - "caracteristicas de la vivienda" -> "Características de la Vivienda"
 * - "tipo_vivienda" -> "Tipo de Vivienda" (si contiene guion bajo)
 */
export function toTitleCase(text: string): string {
    if (!text || typeof text !== 'string') return text ?? '';

    // Reemplaza guiones bajos por espacios si vienen de identificadores de BD
    const cleanText = text.replace(/_/g, ' ').trim();
    if (!cleanText) return '';

    const words = cleanText.split(/\s+/);

    return words
        .map((word, index) => {
            const lower = word.toLowerCase();

            // La primera palabra siempre inicia en mayúscula
            if (index === 0) {
                return lower.charAt(0).toUpperCase() + lower.slice(1);
            }

            // Si es un conectivo, se mantiene en minúscula
            if (CONECTIVOS_MINUSCULAS.has(lower)) {
                return lower;
            }

            // Cualquier otra palabra inicia en mayúscula
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(' ');
}
