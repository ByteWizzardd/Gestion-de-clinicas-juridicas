'use server';

import { getAuthTokenFromCookies } from '@/lib/utils/auth';
import { usuariosQueries } from '@/lib/db/queries/usuarios.queries';
import { AppError } from '@/lib/utils/errors';
import { getCurrentUserAction } from './auth';



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
    const token = getAuthTokenFromCookies();
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
    const token = getAuthTokenFromCookies();
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

// Toggle habilitado usuario result interface
export interface toggleHabilitadoUsuarioResult {
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
}


/**
 * Server Action para alternar el estado habilitado de un usuario
 */
export async function toggleHabilitadoUsuarioAction(cedula: string): Promise<toggleHabilitadoUsuarioResult> {
  try {
    // Verificar autenticación
    const token = getAuthTokenFromCookies();
    if (!token) {
      return {
        success: false,
        error: {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
      };
    }

    return await usuariosQueries.toggleHabilitado(cedula);
  } catch (error: unknown) {
    return {
      success: false,
      error: {
        message: (error as Error).message,
        code: (error as Error & { code?: string }).code,
      },
    };
  }
}

export async function deleteUsuarioFisicoAction(
  cedula_usuario: string,
  motivo: string
): Promise<{ success: boolean; error?: { message: string } }> {
  // 1. Obtener usuario actor desde la cookie JWT
  const userResult = await getCurrentUserAction();
  if (!userResult.success || !userResult.data) {
    return {
      success: false,
      error: { message: 'No se pudo determinar el usuario actor' }
    };
  }

  // 2. Validar que sea coordinador
  if (userResult.data.rol !== 'Coordinador') {
    return {
      success: false,
      error: { message: 'Solo los coordinadores pueden eliminar usuarios permanentemente.' }
    };
  }

  try {
    // 3. Ejecutar la eliminación física
    await usuariosQueries.deleteFisico(
      cedula_usuario,
      userResult.data.cedula,
      motivo
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: error instanceof Error ? error.message : 'Error al eliminar usuario' }
    };
  }
}

//*
// Obtener información de un usuario por cédula 
//

export interface GetUsuarioInfoByCedulaResult {
  success: boolean;
  data?: {
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
  } | null;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener la información completa de un usuario por cédula
 */
export async function getUsuarioInfoByCedulaAction(cedula: string): Promise<GetUsuarioInfoByCedulaResult> {
  try {
    // Verificar autenticación
    const token = getAuthTokenFromCookies();
    if (!token) {
      return {
        success: false,
        error: {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const usuario = await usuariosQueries.getInfoByCedula(cedula);

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

    console.error('Error en getUsuarioInfoByCedulaAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener usuario',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}