import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/utils/errors';
import { verifyToken } from '@/lib/utils/security';

/**
 * Extensión de NextRequest con información del usuario autenticado
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    cedula: string;
    rol: string;
  };
}

/**
 * Middleware para verificar autenticación
 * Extrae el token del header Authorization y verifica su validez
 * 
 * @param request Request de Next.js
 * @returns Request con información del usuario autenticado
 * @throws UnauthorizedError si no hay token o es inválido
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('Token de autenticación requerido');
  }

  try {
    const user = await verifyToken(token);
    (request as AuthenticatedRequest).user = user;
    return request as AuthenticatedRequest;
  } catch {
    throw new UnauthorizedError('Token inválido o expirado');
  }
}

/**
 * Middleware para verificar que el usuario tiene un rol específico
 * 
 * @param request Request de Next.js
 * @param allowedRoles Array de roles permitidos
 * @returns Request con información del usuario autenticado
 * @throws UnauthorizedError si el usuario no tiene el rol requerido
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<AuthenticatedRequest> {
  const authRequest = await requireAuth(request);

  if (!authRequest.user || !allowedRoles.includes(authRequest.user.rol)) {
    throw new UnauthorizedError('No tienes permisos para esta acción');
  }

  return authRequest;
}

