import { NextRequest, NextResponse } from 'next/server';
import { clientesQueries } from '@/lib/db/queries/clientes/clientes.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';

/**
 * GET /api/clientes/search?q=cedula&excludeSolicitantes=true
 * Busca clientes por cédula (búsqueda parcial)
 * Si excludeSolicitantes=true, excluye clientes que son solicitantes
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const excludeSolicitantes = searchParams.get('excludeSolicitantes') === 'true';

    if (!query || query.trim().length === 0) {
      return successResponse([]);
    }

    let clientes;
    if (excludeSolicitantes) {
      // Buscar excluyendo solicitantes (para recomendaciones)
      clientes = await clientesQueries.searchByCedulaExcludeSolicitantes(query.trim());
    } else {
      // Búsqueda normal (incluye todos los clientes)
      clientes = await clientesQueries.searchByCedula(query.trim());
    }
    
    return successResponse(clientes);
  } catch (error) {
    return errorResponse(error);
  }
}

