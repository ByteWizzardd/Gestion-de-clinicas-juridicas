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

export interface UpdateCitaParams {
  appointmentId: string;
  date?: string;
  endDate?: string | null;
  orientacion?: string;
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

export interface GetAppointmentFilterOptionsResult {
  success: boolean;
  data?: {
    nucleos: Array<{ id_nucleo: number; nombre_nucleo: string }>;
    usuarios: Array<{ cedula: string; nombres: string; apellidos: string; nombre_completo: string }>;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener opciones de filtros para citas
 */
export async function getAppointmentFilterOptionsAction(): Promise<GetAppointmentFilterOptionsResult> {
  try {
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

    // Importar las queries necesarias
    const { nucleosQueries } = await import('@/lib/db/queries/nucleos.queries');
    const { usuariosQueries } = await import('@/lib/db/queries/usuarios.queries');

    // Obtener núcleos y usuarios en paralelo
    const [nucleos, usuarios] = await Promise.all([
      nucleosQueries.getAll(),
      usuariosQueries.getAll(),
    ]);

    // Formatear usuarios con nombre completo
    const usuariosFormateados = usuarios.map((u) => ({
      cedula: u.cedula,
      nombres: u.nombres,
      apellidos: u.apellidos,
      nombre_completo: `${u.nombres} ${u.apellidos}`.trim(),
    }));

    return {
      success: true,
      data: {
        nucleos,
        usuarios: usuariosFormateados,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'FILTER_OPTIONS_ERROR',
        },
      };
    }

    console.error('Error en getAppointmentFilterOptionsAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener opciones de filtros',
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

export interface UpdateCitaParams {
  appointmentId: string;
  date?: string;
  endDate?: string | null;
  orientacion?: string;
  usuariosAtienden?: string[];
}

/**
 * Server Action para actualizar una cita existente
 */
export async function updateCitaAction(params: UpdateCitaParams): Promise<GetCitasResult> {
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

    // Validar que al menos un campo se esté actualizando
    if (!params.date && params.endDate === undefined && !params.orientacion && params.usuariosAtienden === undefined) {
      return {
        success: false,
        error: {
          message: 'Debe proporcionar al menos un campo para actualizar',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Validar formato de appointmentId
    if (!params.appointmentId || !params.appointmentId.startsWith('cita-')) {
      return {
        success: false,
        error: {
          message: 'ID de cita inválido',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Validar fecha si se proporciona
    if (params.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(params.date)) {
        return {
          success: false,
          error: {
            message: 'Formato de fecha inválido',
            code: 'VALIDATION_ERROR',
          },
        };
      }
    }

    // Validar endDate si se proporciona
    if (params.endDate !== null && params.endDate !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(params.endDate)) {
        return {
          success: false,
          error: {
            message: 'Formato de fecha de próxima cita inválido',
            code: 'VALIDATION_ERROR',
          },
        };
      }
    }

    // Validar orientacion si se proporciona
    if (params.orientacion !== undefined) {
      const orientacionTrimmed = params.orientacion.trim();
      if (orientacionTrimmed.length < 10) {
        return {
          success: false,
          error: {
            message: 'La orientación debe tener al menos 10 caracteres',
            code: 'VALIDATION_ERROR',
          },
        };
      }
    }

    // Validar usuariosAtienden si se proporciona
    if (params.usuariosAtienden !== undefined) {
      if (params.usuariosAtienden.length === 0) {
        return {
          success: false,
          error: {
            message: 'Debe seleccionar al menos un usuario',
            code: 'VALIDATION_ERROR',
          },
        };
      }

      // Validar duplicados
      const uniqueCedulas = new Set(params.usuariosAtienden);
      if (uniqueCedulas.size !== params.usuariosAtienden.length) {
        return {
          success: false,
          error: {
            message: 'No puede seleccionar usuarios duplicados',
            code: 'VALIDATION_ERROR',
          },
        };
      }
    }

    const updatedCita = await citasService.updateAppointment({
      appointmentId: params.appointmentId,
      date: params.date,
      endDate: params.endDate,
      orientacion: params.orientacion,
      usuariosAtienden: params.usuariosAtienden,
    });

    return {
      success: true,
      data: updatedCita,
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

    console.error('Error en updateCitaAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al actualizar la cita',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}
