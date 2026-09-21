/**
 * Helper de autenticación para Server Actions
 * Centraliza la lógica de verificación de tokens en Server Actions
 */

import { cookies } from 'next/headers';
import { verifyToken } from './security';
import { authQueries } from '@/lib/db/queries/auth.queries';
import { toUserMessage } from '@/lib/utils/error-messages';
import { logger } from './logger';

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

/** Motivo por el que una petición no quedó autenticada. */
type MotivoRechazo = 'sin_token' | 'token_invalido' | 'cuenta_inactiva';

interface ResolucionAuth {
  user?: { cedula: string; rol: string };
  motivo?: MotivoRechazo;
}

/**
 * Resuelve quién hace la petición, contrastando el token con la base de datos.
 *
 * Verificar solo la firma no alcanza: un token es una foto del usuario en el
 * momento en que se emitió. Si desde entonces la cuenta se deshabilitó o el
 * rol cambió, el claim sigue diciendo lo de antes hasta que expire. Por eso el
 * rol que se devuelve es el de la base de datos, no el del token.
 *
 * Ante un fallo de base de datos se rechaza la petición: para un control de
 * acceso, quedarse sin poder verificar significa no autorizar.
 */
async function resolverUsuarioAutenticado(): Promise<ResolucionAuth> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return { motivo: 'sin_token' };
  }

  let cedula: string;
  try {
    const claims = await verifyToken(token);
    cedula = claims.cedula;
  } catch {
    return { motivo: 'token_invalido' };
  }

  let cuenta: { cedula: string; habilitado: boolean; rol: string } | null;
  try {
    cuenta = await authQueries.getEstadoCuenta(cedula);
  } catch (error) {
    logger.error('[server-auth] No se pudo verificar el estado de la cuenta', error);
    return { motivo: 'cuenta_inactiva' };
  }

  if (!cuenta || cuenta.habilitado !== true) {
    return { motivo: 'cuenta_inactiva' };
  }

  return { user: { cedula: cuenta.cedula, rol: cuenta.rol } };
}

/** Mensaje para el usuario según el motivo del rechazo. */
function mensajeDeRechazo(motivo: MotivoRechazo): string {
  if (motivo === 'cuenta_inactiva') {
    return 'Tu cuenta ya no está activa. Contacta al administrador.';
  }
  if (motivo === 'sin_token') {
    return 'No hay sesión activa. Por favor, inicia sesión nuevamente.';
  }
  return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
}

/**
 * Verifica la autenticación del usuario en una Server Action
 * @returns Resultado con información del usuario autenticado o error
 */
export async function requireAuthInServerAction(): Promise<AuthResult> {
  try {
    const { user, motivo } = await resolverUsuarioAutenticado();

    if (!user) {
      return {
        success: false,
        error: motivo === 'cuenta_inactiva' ? mensajeDeRechazo(motivo) : 'No autorizado',
      };
    }

    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: toUserMessage(error, 'Error desconocido'),
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
    const { user, motivo } = await resolverUsuarioAutenticado();

    if (!user) {
      let message = mensajeDeRechazo(motivo!);

      // Los mensajes a medida solo aplican a los dos casos que ya existían;
      // una cuenta deshabilitada necesita decir otra cosa.
      if (motivo === 'sin_token' && customMessages?.noToken) {
        message = customMessages.noToken;
      } else if (motivo === 'token_invalido' && customMessages?.expiredToken) {
        message = customMessages.expiredToken;
      }

      return {
        success: false,
        error: { message, code: 'UNAUTHORIZED' },
      };
    }

    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: {
        message: toUserMessage(error, 'Error desconocido'),
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
