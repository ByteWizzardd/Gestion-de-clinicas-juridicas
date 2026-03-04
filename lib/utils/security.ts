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

const JWT_SECRET: string = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';
// Por defecto: 30 días. Formato: número seguido de unidad (d=days, h=hours, m=minutes, s=seconds)
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Convierte el formato de tiempo del JWT (ej: '30d') a segundos para usar en cookies
 * @param expiresIn Formato de tiempo del JWT (ej: '30d', '720h', '43200m')
 * @returns Tiempo en segundos
 */
export function jwtExpiresInToSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    // Si no coincide el formato, asumir que es en segundos
    return parseInt(expiresIn, 10) || 60 * 60 * 24 * 30; // Por defecto 30 días
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
      return 60 * 60 * 24 * 30; // Por defecto 30 días
  }
}

/**
 * Verifica un token JWT
 * 
 * @param token Token JWT a verificar
 * @returns Datos del usuario decodificados
 * @throws Error si el token es inválido o expirado
 */
export async function verifyToken(token: string): Promise<{
  cedula: string;
  rol: string;
}> {
  try {
    if (!JWT_SECRET || JWT_SECRET === 'tu-secreto-super-seguro-cambiar-en-produccion') {
      logger.warn('[verifyToken] JWT_SECRET no está configurado o usa el valor por defecto');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { cedula: string; rol: string };

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
  return jwt.sign(
    { cedula, rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as SignOptions
  );
}

/**
 * Genera un hash de contraseña
 * 
 * @param password Contraseña en texto plano
 * @returns Hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
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
 * Sanitiza un string para prevenir inyección SQL
 * Nota: pg ya usa prepared statements, pero esto es una capa adicional
 * 
 * @param input String a sanitizar
 * @returns String sanitizado
 */
export function sanitizeInput(input: string): string {
  // Remover caracteres peligrosos
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .trim();
}

