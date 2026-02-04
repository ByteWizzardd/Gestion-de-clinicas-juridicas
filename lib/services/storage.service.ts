/**
 * Storage Service - Vercel Blob integration
 * Maneja el almacenamiento de archivos (fotos de perfil y soportes)
 */

import { put, del, list } from '@vercel/blob';

// Tipos de archivos soportados
export type StorageFolder = 'profile-photos' | 'soportes';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export interface DeleteResult {
    success: boolean;
    error?: string;
}

/**
 * Genera un nombre de archivo único
 */
function generateUniqueFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop() || '';
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');

    if (prefix) {
        return `${prefix}_${baseName}_${timestamp}_${randomStr}.${extension}`;
    }
    return `${baseName}_${timestamp}_${randomStr}.${extension}`;
}

/**
 * Sube un archivo a Vercel Blob
 * @param file - El archivo como Buffer o Blob
 * @param filename - Nombre original del archivo
 * @param folder - Carpeta destino ('profile-photos' | 'soportes')
 * @param prefix - Prefijo opcional para el nombre (ej: cédula del usuario)
 */
export async function uploadFile(
    file: Buffer | Blob,
    filename: string,
    folder: StorageFolder,
    prefix?: string
): Promise<UploadResult> {
    try {
        const uniqueFilename = generateUniqueFilename(filename, prefix);
        const pathname = `${folder}/${uniqueFilename}`;

        const blob = await put(pathname, file, {
            access: 'public',
            addRandomSuffix: false, // Ya generamos nuestro propio sufijo único
        });

        return {
            success: true,
            url: blob.url,
        };
    } catch (error) {
        console.error('Error uploading file to Vercel Blob:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al subir archivo',
        };
    }
}

/**
 * Sube una foto de perfil
 * @param file - La imagen como Buffer
 * @param cedula - Cédula del usuario (se usa como prefijo)
 * @param filename - Nombre original del archivo
 */
export async function uploadProfilePhoto(
    file: Buffer,
    cedula: string,
    filename: string
): Promise<UploadResult> {
    return uploadFile(file, filename, 'profile-photos', cedula.replace(/[^a-zA-Z0-9]/g, '_'));
}

/**
 * Sube un documento de soporte
 * @param file - El archivo como Buffer
 * @param idCaso - ID del caso (se usa como prefijo)
 * @param filename - Nombre original del archivo
 */
export async function uploadSoporte(
    file: Buffer,
    idCaso: number,
    filename: string
): Promise<UploadResult> {
    return uploadFile(file, filename, 'soportes', `caso_${idCaso}`);
}

/**
 * Elimina un archivo de Vercel Blob por su URL
 * @param url - URL completa del archivo en Vercel Blob
 */
export async function deleteFile(url: string): Promise<DeleteResult> {
    try {
        await del(url);
        return { success: true };
    } catch (error) {
        console.error('Error deleting file from Vercel Blob:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al eliminar archivo',
        };
    }
}

/**
 * Lista archivos en una carpeta específica
 * @param folder - Carpeta a listar
 * @param prefix - Prefijo adicional opcional
 */
export async function listFiles(folder: StorageFolder, prefix?: string): Promise<string[]> {
    try {
        const path = prefix ? `${folder}/${prefix}` : folder;
        const { blobs } = await list({ prefix: path });
        return blobs.map(blob => blob.url);
    } catch (error) {
        console.error('Error listing files from Vercel Blob:', error);
        return [];
    }
}

/**
 * Obtiene la extensión del archivo desde el nombre
 */
export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Valida si el tipo MIME es una imagen
 */
export function isImageMimeType(mimeType: string): boolean {
    return mimeType.startsWith('image/');
}

/**
 * Valida si el archivo es un tipo permitido para soportes
 */
export function isValidSoporteMimeType(mimeType: string): boolean {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',
        'audio/aac',
        'audio/x-m4a',
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'video/x-ms-wmv',
        'video/x-flv',
        'video/webm',
    ];
    return allowedTypes.includes(mimeType);
}
