'use server';
import { notificarVariosUsuariosService } from '@/lib/services/notificaciones.service';
import { notificacionesQueries } from '@/lib/db/queries/notificaciones.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

export interface CreateNotificacionResult {
  success: boolean;
  data?: unknown;
  error?: {
    message: string;
    code?: string;
  };
}
/**
 * Server Action para crear una nueva notificación
 */
export async function createNotificacionAction(data: {
  cedulaReceptor: string;
  cedulaEmisor: string;
  titulo: string;
  mensaje: string;
}): Promise<CreateNotificacionResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const nuevaNotificacion = await notificacionesQueries.create({
      cedulaReceptor: data.cedulaReceptor,
      cedulaEmisor: data.cedulaEmisor,
      titulo: data.titulo,
      mensaje: data.mensaje,
    });

    return {
      success: true,
      data: nuevaNotificacion,
    };
  } catch (error) {
    return handleServerActionError(error, 'createNotificacionAction', 'NOTIFICACION_CREATE_ERROR');
  }
}

export interface NotificarVariosUsuariosResult {
  success: boolean;
  data?: Array<{ cedulaReceptor: string }>;
  error?: { message: string; code?: string };
}

/**
 * Server Action para notificar a varios usuarios
 */
export async function notificarVariosUsuariosAction(data: {
  cedulasReceptores: string[];
  titulo: string;
  mensaje: string;
}): Promise<NotificarVariosUsuariosResult> {
  try {
    // Verificar autenticación y obtener emisor
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }
    const cedulaEmisor = authResult.user.cedula;

    // Llamar al service
    const result = await notificarVariosUsuariosService({
      cedulaEmisor,
      cedulasReceptores: data.cedulasReceptores,
      titulo: data.titulo,
      mensaje: data.mensaje,
    });
    return result;
  } catch (error) {
    return handleServerActionError(error, 'notificarVariosUsuariosAction', 'NOTIFICACION_MASIVA_ERROR');
  }
}