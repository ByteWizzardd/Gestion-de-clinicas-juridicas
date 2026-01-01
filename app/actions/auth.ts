'use server';

import { cookies } from 'next/headers';
import { authService } from '@/lib/services/auth.service';
import { authQueries } from '@/lib/db/queries/auth.queries';
import { jwtExpiresInToSeconds, verifyToken } from '@/lib/utils/security';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';
import crypto from "crypto";

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
          message: 'Usuario no encontrado',
          code: 'NOT_FOUND',
        },
      };
    }

    if (user.habilitado_sistema === false) {
      return {
        success: false,
        error: {
          message: 'El usuario está deshabilitado. Contacte al coordinador.',
          code: 'USER_DISABLED',
        },
      };
    }

    // Continuar con el login normal
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
    const user = await authQueries.getUserByCedula(authResult.user.cedula);

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
        rol: user.rol_sistema || authResult.user.rol,
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
    cedula: string;
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

    console.log(`🔍 Buscando usuario con correo: "${normalizedEmail}" (original: "${email}")`);

    // Verificar que el correo existe y obtener la cédula
    const { usuariosQueries } = await import('@/lib/db/queries/usuarios.queries');
    const usuarios = await usuariosQueries.searchByEmail(normalizedEmail);

    console.log(`📊 Resultados encontrados: ${usuarios.length} usuario(s)`);
    if (usuarios.length > 0) {
      console.log(`   Usuario encontrado: ${usuarios[0].nombre_completo} (${usuarios[0].cedula})`);
      console.log(`   Correo en BD: "${usuarios[0].correo_electronico}"`);
    }

    if (usuarios.length === 0) {
      console.log(`⚠️  Correo "${normalizedEmail}" NO existe en la base de datos`);
      return {
        success: true,
        data: {
          message: 'El correo electrónico ingresado no está registrado en nuestro sistema. Por favor, verifique el correo e intente nuevamente.',
          emailFound: false, // No redirigir si el correo no existe
        },
      };
    }

    // Por seguridad, siempre retornamos el mismo mensaje cuando el correo existe
    const successMessage = 'Si el correo existe en nuestro sistema, recibirás un código de verificación por correo electrónico.';

    const usuario = usuarios[0];
    const cedula = usuario.cedula;
    const nombre = usuario.nombres || 'Usuario';

    // Generar código de verificación
    const codigo = generateVerificationCode();

    // Calcular fecha de expiración (24 horas desde ahora)
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 1);

    // Guardar token en la base de datos
    const { passwordResetQueries } = await import('@/lib/db/queries/password-reset.queries');
    await passwordResetQueries.createToken({
      cedula_usuario: cedula,
      codigo_verificacion: codigo,
      fecha_expiracion: fechaExpiracion,
    });

    // Enviar email con el código (usar el correo normalizado)
    const { emailService } = await import('@/lib/services/email.service');
    // Usar el correo de la BD para asegurar que coincida exactamente
    const emailToSend = usuario.correo_electronico || normalizedEmail;
    console.log(`📧 Enviando código a: "${emailToSend}"`);
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
          message: error.message,
          code: error.code || 'AUTH_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al procesar la solicitud',
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
    const codigo = formData.get('codigo') as string;

    if (!codigo || codigo.trim() === '') {
      return {
        success: false,
        error: {
          message: 'El código de verificación es requerido',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Buscar token por código
    const { passwordResetQueries } = await import('@/lib/db/queries/password-reset.queries');
    const token = await passwordResetQueries.getByCode(codigo.trim());

    if (!token) {
      return {
        success: false,
        error: {
          message: 'Código de verificación inválido o expirado',
          code: 'INVALID_CODE',
        },
      };
    }

    // Marcar token como usado
    await passwordResetQueries.markAsUsed(token.id_token);

    return {
      success: true,
      data: {
        cedula: token.cedula_usuario,
        email: token.correo_electronico,
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
        message: error instanceof Error ? error.message : 'Error al verificar el código',
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
    const cedula = formData.get('cedula') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!cedula || !newPassword || !confirmPassword) {
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

    if (newPassword.length < 6) {
      return {
        success: false,
        error: {
          message: 'La contraseña debe tener al menos 6 caracteres',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Obtener correo del usuario por cédula
    const { usuariosQueries } = await import('@/lib/db/queries/usuarios.queries');
    const usuario = await usuariosQueries.getCompleteByCedula(cedula.trim());

    if (!usuario) {
      return {
        success: false,
        error: {
          message: 'Usuario no encontrado',
          code: 'NOT_FOUND',
        },
      };
    }

    // Hash de la nueva contraseña
    const { hashPassword } = await import('@/lib/utils/security');
    const passwordHash = await hashPassword(newPassword);

    // Actualizar contraseña usando el correo
    await usuariosQueries.updatePasswordByEmail(usuario.correo_electronico, passwordHash);

    return {
      success: true,
      data: {
        message: 'Contraseña actualizada exitosamente',
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
        message: error instanceof Error ? error.message : 'Error al restablecer la contraseña',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}