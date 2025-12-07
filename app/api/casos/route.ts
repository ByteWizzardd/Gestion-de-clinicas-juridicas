import { NextRequest, NextResponse } from 'next/server';
import { casosService } from '@/lib/services/casos/casos.service';

/**
 * GET /api/casos
 * Obtiene todos los casos con información enriquecida
 */
export async function GET(request: NextRequest) {
    try {
        const casos = await casosService.getAllCasos();

        return NextResponse.json(casos, { status: 200 });
    } catch (error) {
        console.error('Error en GET /api/casos:', error);

        return NextResponse.json(
            {
                error: 'Error al obtener los casos',
                message: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}
