/**
 * Utilidad para convertir URLs de Vercel Blob privado
 * en URLs seguras que pasan por el proxy autenticado.
 */

/**
 * Convierte una URL de Vercel Blob en una URL del proxy seguro.
 * Usar en todos los componentes que muestran imágenes de perfil o soportes.
 *
 * @param blobUrl - URL interna del blob (almacenada en la base de datos)
 * @returns URL del proxy `/api/blob/image?url=<blobUrl>` o null si no hay URL
 */
export function getBlobProxyUrl(blobUrl: string | null | undefined): string | null {
    if (!blobUrl || blobUrl.trim() === '') return null;
    return `/api/blob/image?url=${encodeURIComponent(blobUrl)}`;
}
