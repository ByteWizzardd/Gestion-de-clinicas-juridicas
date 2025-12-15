import { NextRequest, NextResponse } from 'next/server';
import { ambitosLegalesQueries } from '@/lib/db/queries/ambitos-legales/ambitos-legales.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';
import { requireApiAuth } from '@/lib/utils/api-auth';

/**
 * GET /api/ambitos-legales
 * Obtiene todos los ámbitos legales disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireApiAuth(request);
    if (unauthorized) return unauthorized;

    const ambitos = await ambitosLegalesQueries.getAll();
    return successResponse(ambitos);
  } catch (error) {
    return errorResponse(error);
  }
}

