import { NextRequest, NextResponse } from 'next/server';
import { casosService } from '@/lib/services/casos/casos.service';
import { successResponse, errorResponse } from '@/lib/utils/responses';
import { verifyToken } from '@/lib/utils/security';
import { UnauthorizedError } from '@/lib/utils/errors';
import { requireApiAuth } from '@/lib/utils/api-auth';

/**
 * GET /api/casos
 * Obtiene todos los casos con información enriquecida
 * GET /api/casos?action=next-number
 * Obtiene el siguiente número de caso disponible
 */
export async function GET(request: NextRequest) {
    try {
        const unauthorized = requireApiAuth(request);
        if (unauthorized) return unauthorized;

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'next-number') {
            const nextNumber = await casosService.getNextCaseNumber();
            return successResponse({ nextNumber });
        }

        // Si no es next-number, retornar todos los casos (comportamiento original)
        const casos = await casosService.getAllCasos();
        return successResponse(casos);
    } catch (error) {
        return errorResponse(error);
    }
}

/**
 * POST /api/casos
 * Crea un nuevo caso
 * Requiere autenticación: obtiene la cédula del usuario desde el token
 */
export async function POST(request: NextRequest) {
    try {
        const unauthorized = requireApiAuth(request);
        if (unauthorized) return unauthorized;

        // Obtener token de la cookie
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            console.error('[POST /api/casos] No se encontró token en las cookies');
            throw new UnauthorizedError('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        }

        // Verificar token y obtener cédula del usuario
        let decoded;
        try {
            decoded = await verifyToken(token);
        } catch (verifyError) {
            console.error('[POST /api/casos] Error al verificar token:', verifyError);
            throw new UnauthorizedError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        
        const cedulaUsuario = decoded.cedula;

        const body = await request.json();
        const nuevoCaso = await casosService.createCaso(body, cedulaUsuario);
        
        return successResponse(nuevoCaso, 201);
    } catch (error) {
        return errorResponse(error);
    }
}
