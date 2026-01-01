'use server';

import { usuariosQueries } from '@/lib/db/queries/usuarios.queries';
import { AppError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

export interface GetUsuarioCompleteByCedulaResult {
  success: boolean;
  data?: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    telefono_celular: string | null;
    nombre_completo: string;
  } | null;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener un usuario completo por cédula
 */
export async function getUsuarioCompleteByCedulaAction(cedula: string): Promise<GetUsuarioCompleteByCedulaResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const usuario = await usuariosQueries.getCompleteByCedula(cedula);

    return {
      success: true,
      data: usuario,
    };
  } catch (error) {
    return handleServerActionError(error, 'getUsuarioCompleteByCedulaAction', 'USUARIO_ERROR');
  }
}

export interface GetUsuariosResult {
  success: boolean;
  data?: Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string;
    nombre_usuario: string;
    telefono_celular: string | null;
    habilitado_sistema: boolean;
    tipo_usuario: string;
    info_estudiante: string | null;
    info_profesor: string | null;
    info_coordinador: string | null;
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener todos los usuarios
 */
export async function getUsuariosAction(): Promise<GetUsuariosResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const usuarios = await usuariosQueries.getAll();

    return {
      success: true,
      data: usuarios,
    };
  } catch (error) {
    return handleServerActionError(error, 'getUsuariosAction', 'USUARIO_ERROR');
  }
}

