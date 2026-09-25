/**
 * Utilidades de seguridad
 * Funciones para:
 * - Hash de contraseñas (bcryptjs)
 * - Generación y verificación de JWT
 * - Validación de tokens
 * - Sanitización de inputs
 */

import bcrypt from 'bcryptjs';
import jwt, { TokenExpiredError, JsonWebTokenError, SignOptions } from 'jsonwebtoken';
import { logger } from './logger';

/**
 * Algoritmo único aceptado al firmar y verificar.
 * Fijarlo evita que un token firmado con otro algoritmo sea aceptado.
 */
const JWT_ALGORITHM = 'HS256' as const;

/** Longitud mínima exigida al secreto. */
const LONGITUD_MINIMA_SECRETO = 32;

/**
 * Valores que alguna vez estuvieron como respaldo en el código o en
 * docker-compose. Son públicos (están en el repositorio), así que firmar con
 * ellos equivale a no tener secreto.
 */
const SECRETOS_PROHIBIDOS = new Set([
  'tu-secreto-super-seguro-cambiar-en-produccion',
  'clave-secreta-de-produccion-cambiar',
  'build_dummy_jwt_secret_key',
]);

// Por defecto: 12 horas. Formato: número seguido de unidad (d=days, h=hours, m=minutes, s=seconds)
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '12h';

/**
 * Devuelve el secreto de firma, o lanza si no es utilizable.
 *
 * Se resuelve en cada llamada (no al importar el módulo) para que el build de
 * Next no falle por una variable que solo existe en tiempo de ejecución.
 *
 * @throws Error si el secreto falta, es demasiado corto o es un valor conocido
 */
export function getJwtSecret(): string {
  const secreto = process.env.JWT_SECRET?.trim();

  if (!secreto) {
    logger.error('[security] JWT_SECRET no está definida');
    throw new Error('El servidor no está configurado correctamente.');
  }

  if (SECRETOS_PROHIBIDOS.has(secreto)) {
    logger.error('[security] JWT_SECRET usa un valor de ejemplo público');
    throw new Error('El servidor no está configurado correctamente.');
  }

  if (secreto.length < LONGITUD_MINIMA_SECRETO) {
    logger.error(
      `[security] JWT_SECRET es demasiado corta (${secreto.length} caracteres, mínimo ${LONGITUD_MINIMA_SECRETO})`
    );
    throw new Error('El servidor no está configurado correctamente.');
  }

  return secreto;
}

/**
 * Convierte el formato de tiempo del JWT (ej: '12h') a segundos para usar en cookies
 * @param expiresIn Formato de tiempo del JWT (ej: '30d', '720h', '43200m')
 * @returns Tiempo en segundos
 */
export function jwtExpiresInToSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    // Si no coincide el formato, asumir que es en segundos
    return parseInt(expiresIn, 10) || 60 * 60 * 12; // Por defecto 12 horas
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd': // días
      return value * 24 * 60 * 60;
    case 'h': // horas
      return value * 60 * 60;
    case 'm': // minutos
      return value * 60;
    case 's': // segundos
      return value;
    default:
      return 60 * 60 * 12; // Por defecto 12 horas
  }
}

/**
 * Verifica un token JWT
 *
 * Solo comprueba la firma y la vigencia. El estado del usuario
 * (habilitado, rol vigente) se valida aparte contra la base de datos en
 * lib/utils/server-auth.ts, porque un claim firmado hace semanas puede
 * describir un usuario que ya cambió.
 *
 * @param token Token JWT a verificar
 * @returns Datos del usuario decodificados
 * @throws Error si el token es inválido o expirado
 */
export async function verifyToken(token: string): Promise<{
  cedula: string;
  rol: string;
  /**
   * Cuándo se emitió el token, en segundos Unix. Como el token se firma una sola
   * vez —al iniciar sesión, y no se refresca— esto es la hora exacta en que
   * empezó la sesión. Lo usa el aviso de casos inactivos para saber si ya avisó
   * en esta sesión o si toca avisar de nuevo.
   */
  iat?: number;
}> {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
    }) as { cedula: string; rol: string; iat?: number };

    if (!decoded.cedula || !decoded.rol) {
      throw new Error('Token no contiene información válida del usuario');
    }

    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      logger.error('[verifyToken] Token expirado');
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    } else if (error instanceof JsonWebTokenError) {
      logger.error('[verifyToken] Token inválido:', error.message);
      throw new Error('Token inválido. Por favor, inicia sesión nuevamente.');
    } else if (error instanceof Error) {
      logger.error('[verifyToken] Error al verificar token:', error.message);
      throw error;
    }
    logger.error('[verifyToken] Error desconocido al verificar token:', error);
    throw new Error('Token inválido o expirado');
  }
}

/**
 * Genera un token JWT para un usuario
 *
 * @param cedula Cédula del usuario
 * @param rol Rol del usuario
 * @returns Token JWT
 */
export function generateToken(cedula: string, rol: string): string {
  return jwt.sign({ cedula, rol }, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: JWT_ALGORITHM,
  } as SignOptions);
}

/**
 * Genera un hash de contraseña
 *
 * @param password Contraseña en texto plano
 * @returns Hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  // Coste 12: unas 4x más trabajo que 10 por intento de fuerza bruta.
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

/**
 * Compara una contraseña con un hash
 *
 * @param password Contraseña en texto plano
 * @param hash Hash almacenado
 * @returns true si la contraseña coincide
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Sanitiza un string removiendo < y > antes de mostrarlo o almacenarlo.
 *
 * No tiene nada que ver con inyección SQL: contra eso protegen las consultas
 * parametrizadas de pg, que es lo que usa todo lib/db/queries.
 *
 * @param input String a sanitizar
 * @returns String sanitizado
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}
