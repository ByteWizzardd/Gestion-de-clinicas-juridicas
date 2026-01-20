import { validateEmailFormat } from './email-validation';
import { promises as dns } from 'node:dns';

/**
 * Verifica si un dominio de email tiene registros MX válidos
 * @param domain - Dominio a verificar (ej: "gmail.com")
 * @returns true si el dominio tiene registros MX configurados
 */
async function verifyDomainMX(domain: string): Promise<boolean> {
    try {
        const addresses = await dns.resolveMx(domain);
        return addresses && addresses.length > 0;
    } catch (error) {
        console.error(`Error verificando MX records para ${domain}:`, error);
        return false;
    }
}

/**
 * Verifica si un email de Gmail es potencialmente válido
 * Nota: Esta verificación NO puede confirmar al 100% que el email existe
 * debido a las políticas de privacidad de Gmail, pero valida:
 * 1. Formato correcto del email
 * 2. Que sea un dominio de Gmail
 * 3. Que el dominio tenga registros MX válidos
 * 
 * @param email - Email a verificar
 * @returns Objeto con el resultado de la verificación
 */
export async function verifyGmailExists(email: string): Promise<{
    isValid: boolean;
    error?: string;
    reason?: string;
}> {
    // 1. Validar formato básico
    if (!validateEmailFormat(email)) {
        return {
            isValid: false,
            error: 'Formato de email inválido',
            reason: 'El email no tiene un formato válido'
        };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 2. Verificar que sea un Gmail
    if (!trimmedEmail.endsWith('@gmail.com')) {
        return {
            isValid: false,
            error: 'No es un email de Gmail',
            reason: 'Solo se aceptan correos de @gmail.com'
        };
    }

    // 3. Validar que la parte local (antes del @) sea válida
    const localPart = trimmedEmail.split('@')[0];

    // Gmail tiene reglas específicas:
    // - Entre 6 y 30 caracteres
    // - Solo letras, números y puntos
    // - No puede empezar o terminar con punto
    // - No puede tener puntos consecutivos
    if (localPart.length < 6 || localPart.length > 30) {
        return {
            isValid: false,
            error: 'Longitud inválida',
            reason: 'El nombre de usuario debe tener entre 6 y 30 caracteres'
        };
    }

    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        return {
            isValid: false,
            error: 'Formato inválido',
            reason: 'El email no puede empezar o terminar con un punto'
        };
    }

    if (localPart.includes('..')) {
        return {
            isValid: false,
            error: 'Formato inválido',
            reason: 'El email no puede tener puntos consecutivos'
        };
    }

    if (!/^[a-z0-9.]+$/.test(localPart)) {
        return {
            isValid: false,
            error: 'Caracteres inválidos',
            reason: 'Solo se permiten letras, números y puntos'
        };
    }

    // 4. Verificar MX records de Gmail
    const hasMX = await verifyDomainMX('gmail.com');
    if (!hasMX) {
        return {
            isValid: false,
            error: 'Error de verificación',
            reason: 'No se pudo verificar el dominio de Gmail'
        };
    }

    // Si pasa todas las validaciones
    return {
        isValid: true
    };
}

/**
 * Verifica si un email institucional (UCAB) es potencialmente válido
 * @param email - Email a verificar
 * @returns Objeto con el resultado de la verificación
 */
export async function verifyUCABEmail(email: string): Promise<{
    isValid: boolean;
    error?: string;
    reason?: string;
}> {
    // 1. Validar formato básico
    if (!validateEmailFormat(email)) {
        return {
            isValid: false,
            error: 'Formato de email inválido',
            reason: 'El email no tiene un formato válido'
        };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 2. Verificar que sea un email UCAB
    const isEstUCAB = trimmedEmail.endsWith('@est.ucab.edu.ve');
    const isUCAB = trimmedEmail.endsWith('@ucab.edu.ve');

    if (!isEstUCAB && !isUCAB) {
        return {
            isValid: false,
            error: 'No es un email UCAB',
            reason: 'Solo se aceptan correos de @est.ucab.edu.ve o @ucab.edu.ve'
        };
    }

    // 3. Verificar MX records del dominio
    const domain = isEstUCAB ? 'est.ucab.edu.ve' : 'ucab.edu.ve';
    const hasMX = await verifyDomainMX(domain);

    if (!hasMX) {
        return {
            isValid: false,
            error: 'Error de verificación',
            reason: 'No se pudo verificar el dominio institucional'
        };
    }

    return {
        isValid: true
    };
}

/**
 * Verifica cualquier email según su dominio
 * @param email - Email a verificar
 * @returns Objeto con el resultado de la verificación
 */
export async function verifyEmailExists(email: string): Promise<{
    isValid: boolean;
    error?: string;
    reason?: string;
}> {
    const trimmedEmail = email.trim().toLowerCase();

    // Determinar qué tipo de verificación usar
    if (trimmedEmail.endsWith('@gmail.com')) {
        return await verifyGmailExists(email);
    } else if (trimmedEmail.endsWith('@est.ucab.edu.ve') || trimmedEmail.endsWith('@ucab.edu.ve')) {
        return await verifyUCABEmail(email);
    } else {
        // Para otros dominios, solo verificar formato y MX
        if (!validateEmailFormat(email)) {
            return {
                isValid: false,
                error: 'Formato inválido',
                reason: 'El email no tiene un formato válido'
            };
        }

        const domain = trimmedEmail.split('@')[1];
        const hasMX = await verifyDomainMX(domain);

        if (!hasMX) {
            return {
                isValid: false,
                error: 'Dominio inválido',
                reason: 'El dominio del email no existe o no está configurado'
            };
        }

        return {
            isValid: true
        };
    }
}
