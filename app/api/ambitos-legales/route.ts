import { NextRequest, NextResponse } from 'next/server';
import { ambitosLegalesQueries } from '@/lib/db/queries/ambitos-legales/ambitos-legales.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';

/**
 * GET /api/ambitos-legales
 * Obtiene todos los ámbitos legales disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const ambitos = await ambitosLegalesQueries.getAll();
    return successResponse(ambitos);
  } catch (error) {
    return errorResponse(error);
  }
}

