/**
 * Normalización de nombres de archivo.
 *
 * Los nombres que generamos salen de datos del usuario (nombres de
 * solicitantes, archivos que suben como soporte), así que están llenos de
 * acentos y eñes. Reemplazarlos a ciegas por "_" producía nombres ilegibles
 * como "Jos__Rodr_guez"; aquí se transliteran a su equivalente ASCII antes de
 * limpiar el resto.
 *
 * El resultado sigue siendo estrictamente [A-Za-z0-9_]: es lo que permite
 * usarlo tal cual como clave de Vercel Blob sin riesgo de que un nombre como
 * "informe.a/../../profile-photos/foto" se salga de su carpeta.
 */

/**
 * Letras que NFD no descompone porque no son "letra + tilde", sino glifos
 * propios. Las de uso real en español son ñ y ü (esas sí las cubre NFD); el
 * resto aparece en apellidos de origen extranjero.
 */
const LETRAS_ESPECIALES: Record<string, string> = {
    'ß': 'ss',
    'æ': 'ae', 'Æ': 'AE',
    'œ': 'oe', 'Œ': 'OE',
    'ø': 'o', 'Ø': 'O',
    'å': 'a', 'Å': 'A',
    'đ': 'd', 'Đ': 'D',
    'ð': 'd', 'Ð': 'D',
    'þ': 'th', 'Þ': 'TH',
    'ł': 'l', 'Ł': 'L',
};

/**
 * Convierte texto acentuado a ASCII: "José Peña" -> "Jose Pena".
 *
 * NFD separa cada letra acentuada en letra base + marca diacrítica, y el
 * rango \u0300-\u036f borra esas marcas. Se usa ese rango en lugar de \p{M}
 * porque las propiedades Unicode en regex son ES2018 y el proyecto compila a
 * ES2017.
 */
export function removeDiacritics(text: string): string {
    return text
        .replace(/[ßæÆœŒøØåÅđĐðÐþÞłŁ]/g, (c) => LETRAS_ESPECIALES[c] ?? c)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Deja un fragmento de texto listo para formar parte de un nombre de archivo.
 *
 * "José Rodríguez Peña" -> "Jose_Rodriguez_Pena"
 *
 * @param text     Texto de origen.
 * @param fallback Valor a devolver si no queda nada utilizable.
 * @param maxLength Largo máximo del resultado.
 */
export function sanitizeFileNamePart(
    text: string,
    fallback = 'N_A',
    maxLength = 80
): string {
    const limpio = removeDiacritics(text ?? '')
        .replace(/[^a-zA-Z0-9]+/g, '_')  // todo lo demás pasa a "_", sin repetirlo
        .replace(/^_+|_+$/g, '')         // sin "_" sueltos al principio ni al final
        .slice(0, maxLength)
        .replace(/_+$/, '');             // el recorte pudo dejar otro "_" al final

    return limpio || fallback;
}

/**
 * Limpia la extensión de un archivo: sin punto, en minúsculas y sin nada que
 * no sea alfanumérico.
 */
export function sanitizeFileExtension(extension: string, maxLength = 10): string {
    return removeDiacritics(extension ?? '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, maxLength)
        .toLowerCase();
}
