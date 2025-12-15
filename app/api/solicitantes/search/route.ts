import { NextRequest, NextResponse } from 'next/server';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes/solicitantes.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';

/**
 * GET /api/solicitantes/search?q=cedula
 * Busca solicitantes por cédula (búsqueda parcial)
 * Un solicitante es un cliente que tiene al menos un caso registrado
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length === 0) {
      return successResponse([]);
    }

    const solicitantes = await solicitantesQueries.searchByCedula(query.trim());
    
    return successResponse(solicitantes);
  } catch (error) {
    return errorResponse(error);
  }
}

