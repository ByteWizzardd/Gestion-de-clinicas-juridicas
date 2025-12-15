import { NextRequest, NextResponse } from 'next/server';
import { estudiantesQueries } from '@/lib/db/queries/estudiantes/estudiantes.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';
import { requireApiAuth } from '@/lib/utils/api-auth';

/**
 * GET /api/estudiantes/search?q=cedula
 * Busca estudiantes por cédula (búsqueda parcial)
 */
export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireApiAuth(request);
    if (unauthorized) return unauthorized;

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length === 0) {
      return successResponse([]);
    }

    const estudiantes = await estudiantesQueries.searchByCedula(query.trim());
    return successResponse(estudiantes);
  } catch (error) {
    return errorResponse(error);
  }
}

