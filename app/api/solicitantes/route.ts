import { NextRequest } from 'next/server';
import { solicitantesService } from '@/lib/services/solicitantes/solicitantes.service';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes/solicitantes.queries';
import { successResponse, errorResponse } from '@/lib/utils/responses';

/**
 * GET /api/solicitantes
 * Obtiene todos los solicitantes
 */
export async function GET(request: NextRequest) {
  try {
    const result = await solicitantesQueries.getAllSolicitantes();
    
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/solicitantes
 * Registra un nuevo solicitante con todos sus datos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await solicitantesService.create(body);
    
    return successResponse(result, 201);
  } catch (error: any) {
    // Log detallado del error para debugging
    console.error('Error en POST /api/solicitantes:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack,
    });
    return errorResponse(error);
  }
}
