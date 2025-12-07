import { NextRequest, NextResponse } from 'next/server';
import { profesoresQueries } from '@/lib/db/queries/profesores/profesores.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';

/**
 * GET /api/profesores/search?q=cedula
 * Busca profesores por cédula (búsqueda parcial)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length === 0) {
      return successResponse([]);
    }

    const profesores = await profesoresQueries.searchByCedula(query.trim());
    return successResponse(profesores);
  } catch (error) {
    return errorResponse(error);
  }
}

