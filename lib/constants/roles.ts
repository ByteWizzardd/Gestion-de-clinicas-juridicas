/**
 * Constantes de roles del sistema
 */
export const ROLES = {
  ESTUDIANTE: 'Estudiante',
  PROFESOR: 'Profesor',
  COORDINADOR: 'Coordinador',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Verifica si un string es un rol válido
 */
export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role);
}

