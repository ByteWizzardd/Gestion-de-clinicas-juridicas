/**
 * Reglas de campo compartidas por los formularios de personas (solicitantes,
 * beneficiarios, usuarios). Devuelven el mensaje de error o undefined.
 */

/** Letras (con acentos y ñ), espacios, apóstrofo y guion: "D'Alessandro", "María-José". */
const NOMBRE_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'’\- ]+$/;

/** Longitud de las columnas nombres/apellidos en la base (VARCHAR(100)). */
export const NOMBRE_MAX = 100;

export function validarNombre(valor: string | null | undefined, { requerido = true } = {}): string | undefined {
    const v = (valor ?? '').trim();
    if (!v) return requerido ? 'Este campo es requerido' : undefined;
    if (!NOMBRE_REGEX.test(v)) return 'Solo se permiten letras, espacios, apóstrofo (\') y guion (-)';
    if (v.length > NOMBRE_MAX) return `No puede superar ${NOMBRE_MAX} caracteres`;
    return undefined;
}

/**
 * Número de cédula venezolana (V o E), sin la letra. Las cédulas reales van de
 * 6 a 8 dígitos; se deja de 5 a 9 para no bloquear cédulas antiguas o E altas.
 */
export function validarCedulaNumero(valor: string | null | undefined, { requerido = true } = {}): string | undefined {
    const v = (valor ?? '').trim();
    if (!v) return requerido ? 'Este campo es requerido' : undefined;
    if (!/^\d+$/.test(v)) return 'Solo se permiten números';
    if (v.length < 5 || v.length > 9) return 'La cédula debe tener entre 5 y 9 dígitos';
    return undefined;
}

/** Entero >= min (las cantidades se guardan en columnas INTEGER). */
export function validarEntero(valor: string | null | undefined, { min = 0, requerido = true } = {}): string | undefined {
    const v = (valor ?? '').trim();
    if (!v) return requerido ? 'Este campo es requerido' : undefined;
    if (!/^\d+$/.test(v)) return 'Debe ser un número entero, sin decimales';
    const n = Number(v);
    if (n < min) return `Debe ser mayor o igual a ${min}`;
    if (n > 2147483647) return 'El número es demasiado grande';
    return undefined;
}
