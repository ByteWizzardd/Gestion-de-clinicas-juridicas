/**
 * Teléfonos: una sola regla para todos los formularios y el servidor.
 *
 * El formato canónico es "<código>-<número>", p. ej. "+58-4122727981", que es
 * lo que produce PhoneInput. En la base conviven además formatos viejos o de
 * la carga inicial ("04122727981", "0412-2727981", "+584122727981"), así que
 * todo valor se normaliza antes de mostrarlo o validarlo.
 */

/** Códigos que ofrece el selector. Ordenados como se muestran. */
export const PHONE_CODES = [
    '+58',  // Venezuela
    '+1',   // Estados Unidos/Canadá
    '+52',  // México
    '+57',  // Colombia
    '+51',  // Perú
    '+56',  // Chile
    '+54',  // Argentina
    '+55',  // Brasil
    '+593', // Ecuador
    '+595', // Paraguay
    '+598', // Uruguay
    '+591', // Bolivia
    '+34',  // España
];

const CODES_MAS_LARGOS_PRIMERO = [...PHONE_CODES].sort((a, b) => b.length - a.length);

export interface TelefonoPartes {
    code: string;
    number: string;
}

/**
 * Separa código y número de cualquier formato conocido. Sin código explícito
 * se asume Venezuela y se quita el 0 inicial ("0412…" → "+58" / "412…").
 */
export function parsePhone(value: string | null | undefined): TelefonoPartes {
    const raw = (value ?? '').replace(/[\s()]/g, '');
    if (!raw) return { code: '+58', number: '' };

    const dash = /^(\+\d{1,4})-(.*)$/.exec(raw);
    if (dash) return { code: dash[1], number: dash[2].replace(/\D/g, '') };

    if (raw.startsWith('+')) {
        // Sin guion el código es ambiguo ("+584122727981"): se prueba primero
        // con los códigos conocidos, del más largo al más corto.
        const conocido = CODES_MAS_LARGOS_PRIMERO.find((c) => raw.startsWith(c));
        const code = conocido ?? /^\+\d{1,3}/.exec(raw)?.[0] ?? '+58';
        return { code, number: raw.slice(code.length).replace(/\D/g, '') };
    }

    return { code: '+58', number: raw.replace(/\D/g, '').replace(/^0+/, '') };
}

/** Valor canónico "+58-4122727981" (o "+58-" si no hay número). */
export function normalizePhone(value: string | null | undefined): string {
    const { code, number } = parsePhone(value);
    return `${code}-${number}`;
}

/** true si el valor no trae número (vacío, "+58", "+58-"). */
export function isPhoneEmpty(value: string | null | undefined): boolean {
    return parsePhone(value).number === '';
}

/**
 * Mensaje de error o undefined. Venezuela: 10 dígitos empezando por 4
 * (412…, 414…, 424…); otros países: entre 7 y 15 dígitos.
 */
export function validatePhone(value: string | null | undefined, { required = false } = {}): string | undefined {
    const { code, number } = parsePhone(value);
    if (!number) return required ? 'Este campo es requerido' : undefined;
    if (code === '+58') {
        if (!/^4\d{9}$/.test(number)) {
            return 'Número venezolano inválido. Debe tener 10 dígitos y empezar con 4 (ej: 412...), sin el 0 inicial.';
        }
    } else if (number.length < 7 || number.length > 15) {
        return 'Número de teléfono inválido. Debe tener entre 7 y 15 dígitos.';
    }
    return undefined;
}
