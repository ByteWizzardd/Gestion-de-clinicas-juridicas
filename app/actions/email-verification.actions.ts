'use server';

import { verifyEmailExists } from '@/lib/utils/email-verification';

/**
 * Server action para verificar si un email existe
 * @param email - Email a verificar
 * @returns Resultado de la verificación
 */
export async function verifyEmailExistsAction(email: string): Promise<{
    isValid: boolean;
    error?: string;
    reason?: string;
}> {
    try {
        return await verifyEmailExists(email);
    } catch (error) {
        console.error('Error en verifyEmailExistsAction:', error);
        return {
            isValid: false,
            error: 'Error de verificación',
            reason: 'Ocurrió un error al verificar el email',
        };
    }
}
