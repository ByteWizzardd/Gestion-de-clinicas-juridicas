import { NextRequest, NextResponse } from 'next/server';
import { nucleosQueries } from '@/lib/db/queries/nucleos/nucleos.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';
import { requireApiAuth } from '@/lib/utils/api-auth';

/**
 * GET /api/nucleos
 * Obtiene todos los núcleos disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireApiAuth(request);
    if (unauthorized) return unauthorized;

    const nucleos = await nucleosQueries.getAll();
    return successResponse(nucleos);
  } catch (error) {
    return errorResponse(error);
  }
}

