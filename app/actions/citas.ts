'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { citasService } from '@/lib/services/citas.service';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';
import { appointmentSchema } from '@/lib/validations/appointment.schema';

export interface GetCitasResult {
  success: boolean;
  data?: unknown | unknown[];
  error?: {
    message: string;
    code?: string;
  };
}

export interface CreateCitaParams {
  caseId: number;
  date: string;
  endDate?: string;
  orientacion: string;
  usuariosAtienden?: string[];
}

/**
 * Server Action para obtener todas las citas
 */
export async function createCitaAction(params: CreateCitaParams): Promise<GetCitasResult> { 
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const parseResult = appointmentSchema.safeParse(params);
    console.log('DEBUG createCitaAction params:', params);
    console.log('DEBUG createCitaAction parseResult:', parseResult);
    if (!parseResult.success) {
      console.error('Validación fallida en createCitaAction:', parseResult.error);
      return {
        success: false,
        error: {
          message: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
        },
      };
    }

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
    } catch {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }
    // Convertir caseId a número antes de guardar en la base de datos
    const newCita = await citasService.createAppointment({
      ...params,
      caseId: Number(params.caseId),
    });

    return {
      success: true,
      data: newCita,
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

    console.error('Error en createCitaAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al crear la cita',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

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
    } catch {
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

