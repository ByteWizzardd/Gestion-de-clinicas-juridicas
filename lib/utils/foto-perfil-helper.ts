/**
 * Utility functions for handling profile photos
 * Supports both legacy Buffer format and new URL string format
 */

/**
 * Convierte una foto de perfil a un formato de string para el frontend.
 * 
 * Después de la migración a Vercel Blob, las fotos de perfil se almacenan como URLs.
 * Esta función maneja tanto el formato antiguo (Buffer/BYTEA) como el nuevo (URL string).
 * 
 * @param foto - La foto de perfil que puede ser Buffer, string (URL) o null
 * @returns URL de la foto o null si no existe
 */
export function convertFotoPerfilToString(foto: Buffer | string | null | undefined): string | null {
    if (!foto) {
        return null;
    }

    // Si ya es un string (URL), retornarlo directamente
    if (typeof foto === 'string') {
        return foto;
    }

    // Si es un Buffer (formato legacy), convertir a base64
    // Esto permite compatibilidad con registros de auditoría antiguos
    if (Buffer.isBuffer(foto)) {
        return `data:image/jpeg;base64,${foto.toString('base64')}`;
    }

    return null;
}
