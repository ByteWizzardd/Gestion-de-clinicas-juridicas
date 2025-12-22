'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { citasService } from '@/lib/services/citas/citas.service';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';

export interface GetCitasResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener todas las citas
 */
export async function getCitasAction(): Promise<GetCitasResult> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const appointments = await citasService.getAllAppointments();

    return {
      success: true,
      data: appointments,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CITA_ERROR',
        },
      };
    }

    console.error('Error en getCitasAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener citas',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

