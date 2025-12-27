'use server';

import { cookies } from 'next/headers';
import { usuariosQueries } from '@/lib/db/queries/usuarios.queries';
import { AppError } from '@/lib/utils/errors';

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

    const usuario = await usuariosQueries.getCompleteByCedula(cedula);

    return {
      success: true,
      data: usuario,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'USUARIO_ERROR',
        },
      };
    }

    console.error('Error en getUsuarioCompleteByCedulaAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener usuario',
        code: 'UNKNOWN_ERROR',
      },
    };
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

    const usuarios = await usuariosQueries.getAll();

    return {
      success: true,
      data: usuarios,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'USUARIO_ERROR',
        },
      };
    }

    console.error('Error en getUsuariosAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener usuarios',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

