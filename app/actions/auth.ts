'use server';

import { cookies, headers } from 'next/headers';
import { authService } from '@/lib/services/auth.service';
import { authQueries } from '@/lib/db/queries/auth.queries';
import { jwtExpiresInToSeconds, verifyToken, JWT_EXPIRES_IN } from '@/lib/utils/security';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';
import { usuariosQueries } from '@/lib/db/queries/usuarios.queries';
import crypto from "crypto";
import { toUserMessage } from '@/lib/utils/error-messages';
import { passwordResetQueries } from '@/lib/db/queries/password-reset.queries';
import { emitirResetTicket, verificarResetTicket } from '@/lib/utils/reset-ticket';

// --- Limites contra fuerza bruta --------------------------------------------
/** Intentos de login fallidos tolerados por usuario dentro de la ventana. */
const MAX_INTENTOS_LOGIN = 5;
/** Ventana, en minutos, sobre la que se cuentan esos intentos. */
const VENTANA_LOGIN_MINUTOS = 15;
/** Intentos de codigo de recuperacion tolerados antes de anular el codigo. */
const MAX_INTENTOS_CODIGO = 5;
/** Vigencia del codigo de recuperacion, en minutos. */
const CODIGO_TTL_MINUTOS = 15;
/** Longitud minima de una contrasena nueva. */
const LONGITUD_MINIMA_PASSWORD = 8;

/**
 * Mensaje unico para todo fallo del paso de verificacion.
 *
 * Distinguir "codigo incorrecto" de "no hay codigo" o "demasiados intentos" le
 * diria al atacante en cual de los tres casos esta.
 */
const ERROR_CODIGO_GENERICO = 'Codigo de verificacion invalido o expirado';

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

export interface GetCurrentUserResult {
  success: boolean;
  data?: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: string;
    fotoPerfil?: string | null; // Base64 string o null
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

    // Obtener usuario para validar si está habilitado
    const user = await authQueries.getUserByNombreUsuario(nombreUsuario) as {
      cedula: string;
      nombres: string;
      apellidos: string;
      correo_electronico: string;
      rol_sistema: string;
      password_hash: string;
      habilitado_sistema: boolean;
    } | null;

    if (!user) {
      return {
        success: false,
        error: {
          message: 'Credenciales inválidas',
          code: 'NOT_FOUND',
        },
      };
    }

    if (user.habilitado_sistema === false) {
      // Registrar intento fallido por usuario deshabilitado
      const headersList = await headers();
      const ipDireccion = headersList.get('x-forwarded-for') || 'unknown';
      const dispositivo = headersList.get('user-agent') || 'unknown';

      await authQueries.registrarInicioSesion({
        cedula: user.cedula,
        ipDireccion,
        dispositivo,
        exitoso: false,
        detalle: 'Usuario deshabilitado. Contacte al administrador'
      });

      return {
        success: false,
        error: {
          message: 'Usuario deshabilitado. Contacte al administrador',
          code: 'USER_DISABLED',
        },
      };
    }

    // Obtener IP y User Agent
    const headersList = await headers();
    const ipDireccion = headersList.get('x-forwarded-for') || 'unknown';
    const dispositivo = headersList.get('user-agent') || 'unknown';

    // Frenar la fuerza bruta antes de comparar la contrasena.
    //
    // No se registra un intento fallido adicional aqui: si lo hiciera, un
    // atacante podria mantener bloqueada la cuenta de un usuario legitimo
    // indefinidamente. El bloqueo se levanta solo al vencer la ventana.
    const intentosRecientes = await authQueries.contarIntentosFallidosRecientes(
      user.cedula,
      VENTANA_LOGIN_MINUTOS
    );

    if (intentosRecientes >= MAX_INTENTOS_LOGIN) {
      return {
        success: false,
        error: {
          message: `Demasiados intentos fallidos. Espera ${VENTANA_LOGIN_MINUTOS} minutos e intenta de nuevo.`,
          code: 'TOO_MANY_ATTEMPTS',
        },
      };
    }

    // Auto-cerrar sesiones expiradas. Esto limpiará cualquier sesión "zombie"
    // cada vez que un usuario intente iniciar sesión, manteniendo limpia la BD.
    try {
      const { auditoriaSesionesQueries } = await import('@/lib/db/queries/auditoria-sesiones.queries');
      await auditoriaSesionesQueries.closeExpiredSessions();
    } catch (e) {
      // Ignorar error para no interrumpir el login
    }

    // Continuar con el login normal
    const result = await authService.login({
      nombreUsuario,
      password,
      ipDireccion,
      dispositivo,
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

    // Guardar ID de sesión en una cookie separada para el logout
    if (result.idSesion) {
      cookieStore.set('session_id', result.idSesion.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
      });
    }

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
          message: toUserMessage(error),
          code: error.code || 'AUTH_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Credenciales inválidas',
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

    // Obtener ID de sesión para cerrar la auditoría
    const idSesion = cookieStore.get('session_id')?.value;
    if (idSesion) {
      await authQueries.registrarCierreSesion(parseInt(idSesion));
    }

    cookieStore.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    cookieStore.set('session_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Server Action para obtener el usuario actual autenticado
 */
export async function getCurrentUserAction(): Promise<GetCurrentUserResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Obtener información completa del usuario
    const user = await authQueries.getUserByCedula(authResult.user.cedula) as {
      cedula: string;
      nombres: string;
      apellidos: string;
      correo_electronico: string;
      rol_sistema?: string;
    } | null;

    if (!user) {
      return {
        success: false,
        error: {
          message: 'Usuario no encontrado',
          code: 'NOT_FOUND',
        },
      };
    }

    // Obtener foto de perfil (ahora es una URL directa de Vercel Blob)
    const fotoPerfilUrl = await usuariosQueries.getFotoPerfil(user.cedula);

    return {
      success: true,
      data: {
        cedula: user.cedula,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo_electronico,
        rol: user.rol_sistema || authResult.user.rol,
        fotoPerfil: fotoPerfilUrl,
      },
    };
  } catch (error) {
    return handleServerActionError(error, 'getCurrentUserAction', 'AUTH_ERROR');
  }
}

export interface ForgotPasswordResult {
  success: boolean;
  data?: {
    message: string;
    emailFound?: boolean; // Flag interno para saber si debe redirigir (sin revelar en el mensaje)
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface ResetPasswordResult {
  success: boolean;
  data?: {
    message: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface VerifyCodeResult {
  success: boolean;
  data?: {
    /**
     * Comprobante firmado de que el codigo fue verificado.
     *
     * Sustituye a la cedula que antes viajaba por la URL: el cliente ya no
     * decide de quien es la contrasena que se va a cambiar.
     */
    ticket: string;
    email: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Genera un código de verificación aleatorio de 6 dígitos
 */
function generateVerificationCode(): string {
  // Generar código de 6 dígitos usando crypto de Node.js (más seguro)
  const randomBytes = crypto.randomBytes(3); // 3 bytes = 24 bits, suficiente para 6 dígitos
  const randomNum = parseInt(randomBytes.toString('hex'), 16) % 900000 + 100000; // Entre 100000 y 999999
  return randomNum.toString();
}

/**
 * Compara dos codigos sin filtrar en cuanto difieren.
 *
 * Una comparacion normal con === se detiene en el primer caracter distinto, y
 * esa diferencia de tiempo es medible.
 */
function comparacionSegura(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Server Action para verificar correo y solicitar recuperación de contraseña
 */
export async function forgotPasswordAction(formData: FormData): Promise<ForgotPasswordResult> {
  try {
    const email = formData.get('email') as string;

    if (!email || email.trim() === '') {
      return {
        success: false,
        error: {
          message: 'El correo electrónico es requerido',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Normalizar el correo: trim, lowercase, y eliminar espacios extra
    const normalizedEmail = email.trim().toLowerCase().replace(/\s+/g, '');

    // Verificar que el correo existe y obtener la cédula
    const { usuariosQueries } = await import('@/lib/db/queries/usuarios.queries');
    const usuarios = await usuariosQueries.searchByEmail(normalizedEmail);

    // El mismo mensaje exista o no el correo. Responder distinto permitia
    // averiguar que cuentas estan registradas probando correos.
    const successMessage = 'Si el correo existe en nuestro sistema, recibirás un código de verificación por correo electrónico.';

    if (usuarios.length === 0) {
      return {
        success: true,
        data: {
          message: successMessage,
          emailFound: true,
        },
      };
    }

    const usuario = usuarios[0];
    const cedula = usuario.cedula;
    const nombre = usuario.nombres || 'Usuario';

    // Generar código de verificación
    const codigo = generateVerificationCode();

    // Vigencia corta y real. La columna era DATE, lo que truncaba cualquier
    // caducidad al final del dia; la migracion 20260919_120000 la paso a
    // TIMESTAMP para que estos minutos signifiquen algo.
    const fechaExpiracion = new Date(Date.now() + CODIGO_TTL_MINUTOS * 60 * 1000);

    // Un unico codigo vigente por usuario: emitir uno nuevo anula los previos.
    await passwordResetQueries.invalidateUserTokens(cedula);

    await passwordResetQueries.createToken({
      cedula_usuario: cedula,
      codigo_verificacion: codigo,
      fecha_expiracion: fechaExpiracion,
    });

    // Enviar email con el código (usar el correo normalizado)
    const { emailService } = await import('@/lib/services/email.service');
    // Usar el correo de la BD para asegurar que coincida exactamente
    const emailToSend = usuario.correo_electronico || normalizedEmail;
    await emailService.sendPasswordResetCode(emailToSend, codigo, nombre);

    return {
      success: true,
      data: {
        message: successMessage,
        emailFound: true, // Redirigir solo si el correo existe
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: toUserMessage(error),
          code: error.code || 'AUTH_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: toUserMessage(error, 'Error al procesar la solicitud'),
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para verificar código de recuperación
 */
export async function verifyCodeAction(formData: FormData): Promise<VerifyCodeResult> {
  try {
    const codigo = ((formData.get('codigo') as string | null) ?? '').trim();
    const emailCrudo = (formData.get('email') as string | null) ?? '';
    const email = emailCrudo.trim().toLowerCase().replace(/\s+/g, '');

    if (!codigo || !email) {
      return {
        success: false,
        error: { message: ERROR_CODIGO_GENERICO, code: 'INVALID_CODE' },
      };
    }

    // El codigo se busca DENTRO de la cuenta indicada. La version anterior lo
    // buscaba suelto (WHERE codigo_verificacion = $1), asi que un acierto al
    // azar servia para cualquier usuario sin saber siquiera de quien era.
    const usuarios = await usuariosQueries.searchByEmail(email);

    if (usuarios.length === 0) {
      return {
        success: false,
        error: { message: ERROR_CODIGO_GENERICO, code: 'INVALID_CODE' },
      };
    }

    const cedula = usuarios[0].cedula as string;
    const token = await passwordResetQueries.getActiveByCedula(cedula);

    if (!token) {
      return {
        success: false,
        error: { message: ERROR_CODIGO_GENERICO, code: 'INVALID_CODE' },
      };
    }

    if (token.intentos >= MAX_INTENTOS_CODIGO) {
      await passwordResetQueries.invalidateUserTokens(cedula);
      return {
        success: false,
        error: { message: ERROR_CODIGO_GENERICO, code: 'INVALID_CODE' },
      };
    }

    if (!comparacionSegura(codigo, token.codigo_verificacion)) {
      const intentos = await passwordResetQueries.incrementAttempts(token.id_token);

      // Agotados los intentos el codigo muere: hay que pedir uno nuevo.
      if (intentos >= MAX_INTENTOS_CODIGO) {
        await passwordResetQueries.invalidateUserTokens(cedula);
      }

      return {
        success: false,
        error: { message: ERROR_CODIGO_GENERICO, code: 'INVALID_CODE' },
      };
    }

    // Acierto. El token NO se marca usado todavia: se consume al guardar la
    // contrasena nueva, para que un abandono a mitad de camino no obligue a
    // pedir otro codigo.
    const ticket = emitirResetTicket({ cedula, idToken: token.id_token });

    return {
      success: true,
      data: {
        ticket,
        email: token.correo_electronico,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: toUserMessage(error),
          code: error.code || 'AUTH_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: toUserMessage(error, 'Error al verificar el codigo'),
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para restablecer la contraseña (requiere código verificado)
 */
export async function resetPasswordAction(formData: FormData): Promise<ResetPasswordResult> {
  try {
    const ticket = ((formData.get('ticket') as string | null) ?? '').trim();
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!ticket || !newPassword || !confirmPassword) {
      return {
        success: false,
        error: {
          message: 'Todos los campos son requeridos',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // De quien es la contrasena lo dice el comprobante firmado en el paso
    // anterior, no el formulario. Antes se aceptaba una cedula suelta, de modo
    // que cualquiera podia invocar esta accion y cambiar la clave de otro.
    const datosTicket = verificarResetTicket(ticket);

    if (!datosTicket) {
      return {
        success: false,
        error: {
          message: 'La verificacion expiro o no es valida. Solicita un codigo nuevo.',
          code: 'INVALID_TICKET',
        },
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: {
          message: 'Las contrasenas no coinciden',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (newPassword.length < LONGITUD_MINIMA_PASSWORD) {
      return {
        success: false,
        error: {
          message: `La contrasena debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres`,
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Las validaciones van antes de consumir: un error de tipeo no debe
    // quemar el codigo y obligar a empezar de cero.
    //
    // consumeToken compara y escribe en una sola sentencia, asi que dos
    // peticiones con el mismo comprobante no pueden pasar ambas.
    const consumido = await passwordResetQueries.consumeToken(
      datosTicket.idToken,
      datosTicket.cedula
    );

    if (!consumido) {
      return {
        success: false,
        error: {
          message: 'Esta verificacion ya fue utilizada. Solicita un codigo nuevo.',
          code: 'INVALID_TICKET',
        },
      };
    }

    const usuario = await usuariosQueries.getCompleteByCedula(datosTicket.cedula);

    if (!usuario) {
      return {
        success: false,
        error: {
          message: 'Usuario no encontrado',
          code: 'NOT_FOUND',
        },
      };
    }

    const { hashPassword } = await import('@/lib/utils/security');
    const passwordHash = await hashPassword(newPassword);

    await usuariosQueries.updatePasswordByEmail(usuario.correo_electronico, passwordHash);

    return {
      success: true,
      data: {
        message: 'Contrasena actualizada exitosamente',
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: toUserMessage(error),
          code: error.code || 'AUTH_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: toUserMessage(error, 'Error al restablecer la contrasena'),
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

export interface ChangePasswordResult {
  success: boolean;
  data?: {
    message: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para cambiar la contraseña cuando el usuario está autenticado
 * Valida la contraseña actual y actualiza a la nueva sin necesidad de correo
 */
export async function changePasswordAction(formData: FormData): Promise<ChangePasswordResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        success: false,
        error: {
          message: 'Todos los campos son requeridos',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: {
          message: 'Las contraseñas no coinciden',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (newPassword.length < LONGITUD_MINIMA_PASSWORD) {
      return {
        success: false,
        error: {
          message: `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres`,
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Obtener usuario con su contraseña actual
    const user = await authQueries.getUserByCedula(authResult.user.cedula) as {
      password_hash: string;
      correo_electronico: string;
    } | null;

    if (!user || !user.password_hash) {
      return {
        success: false,
        error: {
          message: 'Usuario no encontrado o sin contraseña configurada',
          code: 'NOT_FOUND',
        },
      };
    }

    // Verificar contraseña actual
    const { comparePassword } = await import('@/lib/utils/security');
    const passwordMatch = await comparePassword(currentPassword, user.password_hash);

    if (!passwordMatch) {
      return {
        success: false,
        error: {
          message: 'La contraseña actual es incorrecta',
          code: 'INVALID_PASSWORD',
        },
      };
    }

    // Hash de la nueva contraseña
    const { hashPassword } = await import('@/lib/utils/security');
    const passwordHash = await hashPassword(newPassword);

    // Actualizar contraseña
    const { usuariosQueries } = await import('@/lib/db/queries/usuarios.queries');
    await usuariosQueries.updatePasswordByEmail(user.correo_electronico, passwordHash);

    return {
      success: true,
      data: {
        message: 'Contraseña actualizada exitosamente',
      },
    };
  } catch (error) {
    return handleServerActionError(error, 'changePasswordAction', 'PASSWORD_CHANGE_ERROR');
  }
}