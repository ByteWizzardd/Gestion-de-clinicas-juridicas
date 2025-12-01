import { NextRequest } from 'next/server';
import { ForbiddenError } from '@/lib/utils/errors';
import { requireAuth, requireRole, AuthenticatedRequest } from './auth.middleware';

/**
 * Roles del sistema
 */
export const ROLES = {
  ESTUDIANTE: 'Estudiante',
  PROFESOR: 'Profesor',
  COORDINADOR: 'Coordinador',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Verifica que el usuario tiene rol de Estudiante
 */
export async function requireEstudiante(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  return requireRole(request, [ROLES.ESTUDIANTE]);
}

/**
 * Verifica que el usuario tiene rol de Profesor
 */
export async function requireProfesor(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  return requireRole(request, [ROLES.PROFESOR]);
}

/**
 * Verifica que el usuario tiene rol de Coordinador
 */
export async function requireCoordinador(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  return requireRole(request, [ROLES.COORDINADOR]);
}

/**
 * Verifica que el usuario tiene rol de Profesor o Coordinador
 */
export async function requireProfesorOrCoordinador(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  return requireRole(request, [ROLES.PROFESOR, ROLES.COORDINADOR]);
}

/**
 * Verifica que el usuario tiene cualquier rol válido
 */
export async function requireAnyRole(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  return requireRole(request, [
    ROLES.ESTUDIANTE,
    ROLES.PROFESOR,
    ROLES.COORDINADOR,
  ]);
}

