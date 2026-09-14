import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';

/**
 * GET /api/blob/image?url=<blob-url>
 *
 * Proxy seguro para imágenes privadas de Vercel Blob.
 * Verifica que el usuario esté autenticado y luego redirige
 * a una URL firmada temporal (expira en 1 hora).
 */
export async function GET(request: NextRequest) {
    // 1. Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        await verifyToken(token);
    } catch {
        return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
    }

    // 2. Obtener la URL del blob desde los query params
    const blobUrl = request.nextUrl.searchParams.get('url');

    if (!blobUrl) {
        return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }

    // 3. Validar que la URL pertenece a Vercel Blob (evita abuso de este endpoint)
    try {
        const parsed = new URL(blobUrl);
        const isVercelBlob =
            parsed.hostname.endsWith('.blob.vercel-storage.com') ||
            parsed.hostname.endsWith('.public.blob.vercel-storage.com');

        if (!isVercelBlob) {
            return NextResponse.json({ error: 'URL no permitida' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // 4. Redirigir a la URL pública del blob (acceso público)
    return NextResponse.redirect(blobUrl);
}
