import { NextRequest, NextResponse } from 'next/server';
import { casosService } from '@/lib/services/casos/casos.service';
import { successResponse, errorResponse } from '@/lib/utils/responses';

/**
 * GET /api/casos
 * Obtiene todos los casos con información enriquecida
 * GET /api/casos?action=next-number
 * Obtiene el siguiente número de caso disponible
 */
export async function GET(request: NextRequest) {
    try {
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
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('POST /api/casos - Datos recibidos:', body);
        
        const nuevoCaso = await casosService.createCaso(body);
        console.log('POST /api/casos - Caso creado exitosamente:', nuevoCaso);
        
        return successResponse(nuevoCaso, 201);
    } catch (error) {
        console.error('POST /api/casos - Error:', error);
        return errorResponse(error);
    }
}
