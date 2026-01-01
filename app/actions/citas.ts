'use server';

import { citasService } from '@/lib/services/citas.service';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';
import { appointmentSchema } from '@/lib/validations/appointment.schema';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

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

    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
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
    return handleServerActionError(error, 'createCitaAction', 'CITA_ERROR');
  }
}

export async function getCitasAction(): Promise<GetCitasResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const appointments = await citasService.getAllAppointments();

    return {
      success: true,
      data: appointments,
    };
  } catch (error) {
    return handleServerActionError(error, 'getCitasAction', 'CITA_ERROR');
  }
}

