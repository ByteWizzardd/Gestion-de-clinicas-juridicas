'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authService } from '@/lib/services/auth/auth.service';
import { authQueries } from '@/lib/db/queries/auth/auth.queries';
import { jwtExpiresInToSeconds, verifyToken } from '@/lib/utils/security';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

export interface LoginResult {
  success: boolean;
  data?: {
    user: {
      cedula: string;
      nombres: string;
      apellidos: string;
      correo: string;
      rol: string;
    };
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface RegisterResult {
  success: boolean;
  data?: {
    user: {
      cedula: string;
      rol: string;
    };
  };
  error?: {
    message: string;
    code?: string;
    fields?: Record<string, string[]>;
  };
}

export interface GetCurrentUserResult {
  success: boolean;
  data?: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para iniciar sesión
 */
export async function loginAction(formData: FormData): Promise<LoginResult> {
  try {
    const nombreUsuario = formData.get('nombreUsuario') as string;
    const password = formData.get('password') as string;

    if (!nombreUsuario || !password) {
      return {
        success: false,
        error: {
          message: 'Nombre de usuario y contraseña son requeridos',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const result = await authService.login({
      nombreUsuario,
      password,
    });

    // Configurar cookie HTTP-only
    const cookieStore = await cookies();
    const cookieMaxAge = jwtExpiresInToSeconds(JWT_EXPIRES_IN);
    
    cookieStore.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
    });

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'AUTH_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al iniciar sesión',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para registrar un nuevo usuario
 */
export async function registerAction(formData: FormData): Promise<RegisterResult> {
  try {
    const nombreCompleto = formData.get('nombreCompleto') as string;
    const cedula = formData.get('cedula') as string;
    const correo = formData.get('correo') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!nombreCompleto || !cedula || !correo || !password || !confirmPassword) {
      return {
        success: false,
        error: {
          message: 'Todos los campos son requeridos',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Extraer nombre completo y dividirlo en nombres y apellidos
    const partesNombre = nombreCompleto.trim().split(' ');
    const nombres = partesNombre.slice(0, Math.ceil(partesNombre.length / 2)).join(' ');
    const apellidos = partesNombre.slice(Math.ceil(partesNombre.length / 2)).join(' ') || nombres;

    const result = await authService.register({
      cedula,
      correo,
      password,
      confirmPassword,
      nombreCompleto,
    });

    // Configurar cookie HTTP-only
    const cookieStore = await cookies();
    const cookieMaxAge = jwtExpiresInToSeconds(JWT_EXPIRES_IN);
    
    cookieStore.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
    });

    return {
      success: true,
      data: {
        user: {
          cedula: result.user.cedula,
          rol: result.user.rol,
        },
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'REGISTRATION_ERROR',
          fields: (error as any).fields,
        },
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al registrar usuario',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para cerrar sesión
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Server Action para obtener el usuario actual autenticado
 */
export async function getCurrentUserAction(): Promise<GetCurrentUserResult> {
  try {
    // Obtener token de la cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: 'No hay sesión activa',
          code: 'UNAUTHORIZED',
        },
      };
    }

    // Verificar token
    const decoded = await verifyToken(token);

    // Obtener información completa del usuario
    const user = await authQueries.getUserByCedula(decoded.cedula);

    if (!user) {
      return {
        success: false,
        error: {
          message: 'Usuario no encontrado',
          code: 'NOT_FOUND',
        },
      };
    }

    return {
      success: true,
      data: {
        cedula: user.cedula,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo_electronico,
        rol: user.rol_sistema || decoded.rol,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'AUTH_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener usuario',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

