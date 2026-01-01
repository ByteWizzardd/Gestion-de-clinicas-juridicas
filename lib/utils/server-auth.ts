/**
 * Helper de autenticación para Server Actions
 * Centraliza la lógica de verificación de tokens en Server Actions
 */

import { cookies } from 'next/headers';
import { verifyToken } from './security';

export interface AuthResult {
  success: boolean;
  user?: {
    cedula: string;
    rol: string;
  };
  error?: string;
}

export interface AuthResultWithCode {
  success: boolean;
  user?: {
    cedula: string;
    rol: string;
  };
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Verifica la autenticación del usuario en una Server Action
 * @returns Resultado con información del usuario autenticado o error
 */
export async function requireAuthInServerAction(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    try {
      const user = await verifyToken(token);
      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }

}

/**
 * Verifica la autenticación con formato de error que incluye código
 * Útil para Server Actions que retornan formato { success, error: { message, code } }
 * @param customMessages Mensajes personalizados para diferentes errores
 * @returns Resultado con información del usuario autenticado o error con código
 */
export async function requireAuthInServerActionWithCode(
  customMessages?: {
    noToken?: string;
    expiredToken?: string;
  }
): Promise<AuthResultWithCode> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: customMessages?.noToken || 'No hay sesión activa. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    try {
      const user = await verifyToken(token);
      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: customMessages?.expiredToken || 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error desconocido',
        code: 'AUTH_ERROR',
      },
    };
  }
}

/**
 * Verifica la autenticación y lanza error si falla
 * Útil cuando necesitas el usuario directamente sin manejar el resultado
 * @returns Usuario autenticado
 * @throws Error si no está autenticado
 */
export async function requireAuthInServerActionOrThrow(): Promise<{
  cedula: string;
  rol: string;
}> {
  const result = await requireAuthInServerAction();
  
  if (!result.success || !result.user) {
    throw new Error(result.error || 'No autorizado');
  }
  
  return result.user;
}
