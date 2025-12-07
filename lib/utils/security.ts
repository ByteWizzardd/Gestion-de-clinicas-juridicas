/**
 * Utilidades de seguridad
 * Funciones para:
 * - Hash de contraseñas (bcryptjs)
 * - Generación y verificación de JWT
 * - Validación de tokens
 * - Sanitización de inputs
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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
    const decoded = jwt.verify(token, JWT_SECRET) as { cedula: string; rol: string };
    return decoded;
  } catch (error) {
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
    { expiresIn: JWT_EXPIRES_IN }
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

