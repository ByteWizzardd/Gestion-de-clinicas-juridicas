'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
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

