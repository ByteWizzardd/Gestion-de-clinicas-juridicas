'use server';

import { citasService } from '@/lib/services/citas.service';
import { notificarVariosUsuariosAction } from '@/app/actions/notificaciones';
import { AppError } from '@/lib/utils/errors';
import { appointmentSchema } from '@/lib/validations/appointment.schema';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';
import { revalidatePath } from 'next/cache';


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
export async function createCitaAction(
  params: CreateCitaParams
): Promise<GetCitasResult> {
  try {
    const parseResult = appointmentSchema.safeParse(params);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          message: "Datos inválidos",
          code: "VALIDATION_ERROR",
        },
      };
    }

    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Crear la cita primero
    const newCita = await citasService.createAppointment({
      ...params,
      caseId: Number(params.caseId),
      idUsuarioRegistro: authResult.user.cedula,
    });


    // Construir appointmentId si no existe
    let appointmentId = '';
    if ('appointmentId' in newCita && typeof newCita.appointmentId === 'string') {
      appointmentId = newCita.appointmentId;
    } else if ('num_cita' in newCita && 'id_caso' in newCita) {
      appointmentId = `cita-${newCita.num_cita}-${newCita.id_caso}`;
    }

    let idCasoNotificar: number | null = null;
    try {
      const citaInfo = citasService.getCitaInfoByAppointmentId(appointmentId);
      idCasoNotificar = citaInfo?.id_caso ?? null;
    } catch {
      idCasoNotificar = null;
    }


    // Notificar a los usuarios asignados a la cita sobre la creación
    const usuariosAtienden = params.usuariosAtienden || [];
    if (idCasoNotificar && usuariosAtienden.length > 0) {
      const urlCitas = `/dashboard/cases/${idCasoNotificar}?tab=citas`;
      await notificarVariosUsuariosAction({
        cedulasReceptores: usuariosAtienden,
        titulo: "Nueva cita asignada",
        mensaje: `Se te ha asignado una nueva cita #${newCita.num_cita} para el caso #${idCasoNotificar} en la fecha ${params.date}. Haz clic aquí para ver la cita: ${urlCitas}`,
      });
      // Revalidar la caché de notificaciones para que se actualicen en el frontend
      revalidatePath("/dashboard/notificaciones");
    }

    // Revalidar la caché de citas
    revalidatePath("/dashboard/citas");

    return {
      success: true,
      data: newCita,
    };
  } catch (error) {
    return handleServerActionError(error, "createCitaAction", "CITA_ERROR");
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
    // Verificar autenticación usando la función centralizada
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
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

// Server Action para obtener todas las citas
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
    // Verificar autenticación usando la función centralizada
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
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
      idUsuarioActualizo: authResult.user.cedula,
    });

    const id_caso = updatedCita ? updatedCita.id_caso : null;
    const usuariosAtienden = params.usuariosAtienden || [];
    // Notificar a los usuarios asignados a la cita sobre la actualización
    if (id_caso && usuariosAtienden.length > 0) {
      const urlCitas = `/dashboard/cases/${id_caso}?tab=citas`;
      await notificarVariosUsuariosAction({
        cedulasReceptores: usuariosAtienden,
        titulo: 'Cita actualizada',
        mensaje: `La cita #${params.appointmentId} del caso #${id_caso} para la fecha ${params.date || 'actualizada'} ha sido modificada. Haz clic aquí para ver la cita: ${urlCitas}`,
      });
      // Revalidar la caché de notificaciones y casos
      revalidatePath('/dashboard/notificaciones');
      revalidatePath('/dashboard/casos');
    }

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

// Server Action para eliminar una cita existente
export interface DeleteCitaParams {
  appointmentId: string;
  motivo: string;
}

/**
 * Server Action para eliminar una cita existente
 */
export async function deleteCitaAction(params: DeleteCitaParams): Promise<GetCitasResult> {
  try {
    // Verificar autenticación usando la función centralizada
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
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

    // Validar motivo
    if (!params.motivo || params.motivo.trim() === '') {
      return {
        success: false,
        error: {
          message: 'El motivo de eliminación es obligatorio',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Consultar usuarios asignados antes de eliminar la cita (para poder notificar)
    let usuariosAtienden: string[] = [];
    let idCasoParaNotificar: number | null = null;
    try {
      const snapshot = await citasService.getUsuariosAtiendenByAppointmentId(params.appointmentId);
      usuariosAtienden = snapshot?.usuariosAtienden || [];
      idCasoParaNotificar = snapshot?.id_caso || null;
    } catch {
      // Si falla el parsing/consulta, seguimos pero no notificamos
      usuariosAtienden = [];
      idCasoParaNotificar = null;
    }

    // Eliminar la cita (registra auditoría antes de eliminar)
    const deletedCita = await citasService.deleteAppointment({
      appointmentId: params.appointmentId,
      idUsuarioElimino: authResult.user.cedula,
      motivo: params.motivo.trim(),
    });

    // Notificar a los usuarios asignados sobre la eliminación (la cita ya no existe, así que enlazamos al caso)
    if (idCasoParaNotificar && usuariosAtienden.length > 0) {
      await notificarVariosUsuariosAction({
        cedulasReceptores: usuariosAtienden,
        titulo: 'Cita eliminada',
        mensaje: `La cita que atendías del caso #${idCasoParaNotificar} ha sido eliminada. Haz clic para ver el caso.`,
      });
      // Revalidar la caché de notificaciones y casos
      revalidatePath('/dashboard/notificaciones');
      revalidatePath('/dashboard/casos');
    }

    const result = {
      success: true,
      data: deletedCita,
    };
    return result;
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

    const errorResult = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al eliminar la cita',
        code: 'UNKNOWN_ERROR',
      },
    };
    return errorResult;
  }
}