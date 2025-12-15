import { NextRequest, NextResponse } from 'next/server';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes/solicitantes.queries';
import { clientesQueries } from '@/lib/db/queries/clientes/clientes.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';
import { requireApiAuth } from '@/lib/utils/api-auth';

/**
 * GET /api/solicitantes/search?q=cedula&type=cedula
 * GET /api/solicitantes/search?q=email@example.com&type=email
 * Busca solicitantes por cédula (búsqueda parcial) o clientes por correo electrónico (búsqueda exacta)
 * Un solicitante es un cliente que tiene todos los datos completos requeridos por el formulario
 * Para email: busca en clientes directamente, no solo en solicitantes
 */
export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireApiAuth(request);
    if (unauthorized) return unauthorized;

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'cedula';

    if (!query || query.trim().length === 0) {
      return successResponse([]);
    }

    if (type === 'email') {
      // Buscar en clientes directamente, no solo en solicitantes
      const clientes = await clientesQueries.searchByEmail(query.trim());
      return successResponse(clientes);
    } else {
      // type === 'cedula' (por defecto)
      const solicitantes = await solicitantesQueries.searchByCedula(query.trim());
      return successResponse(solicitantes);
    }
  } catch (error) {
    return errorResponse(error);
  }
}

