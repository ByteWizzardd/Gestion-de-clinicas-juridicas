import { NextRequest, NextResponse } from 'next/server';
import { clientesQueries } from '@/lib/db/queries/clientes/clientes.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';

/**
 * GET /api/clientes/search?q=cedula
 * Busca clientes por cédula (búsqueda parcial)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length === 0) {
      return successResponse([]);
    }

    const clientes = await clientesQueries.searchByCedula(query.trim());
    return successResponse(clientes);
  } catch (error) {
    return errorResponse(error);
  }
}

