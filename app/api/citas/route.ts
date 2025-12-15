import { NextRequest } from 'next/server';
import { citasService } from '@/lib/services/citas/citas.service';
import { successResponse, errorResponse } from '@/lib/utils/responses';
import { requireApiAuth } from '@/lib/utils/api-auth';

/**
 * API Route para Citas
 * GET /api/citas - Obtiene todas las citas
 */
export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireApiAuth(request);
    if (unauthorized) return unauthorized;

    const appointments = await citasService.getAllAppointments();
    return successResponse(appointments);
  } catch (error) {
    return errorResponse(error);
  }
}

