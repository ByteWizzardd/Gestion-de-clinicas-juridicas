import { UserRole } from '@/components/sidebar/menu-config';

/**
 * Mapea los roles del sistema (Estudiante, Profesor, Coordinador)
 * a los roles del sidebar (student, professor, coordinator)
 */
export function mapSystemRoleToSidebarRole(systemRole: string): UserRole {
  // Normalizar el rol: trim y capitalizar primera letra
  const normalizedRole = systemRole?.trim() || '';
  
  const roleMap: Record<string, UserRole> = {
    'Estudiante': 'student',
    'Profesor': 'professor',
    'Coordinador': 'coordinator',
    // También aceptar variaciones comunes
    'estudiante': 'student',
    'profesor': 'professor',
    'coordinador': 'coordinator',
  };

  return roleMap[normalizedRole] || 'student'; // Default a student si no se encuentra
}

/**
 * Mapea los roles del sidebar a los roles del sistema
 */
export function mapSidebarRoleToSystemRole(sidebarRole: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    'student': 'Estudiante',
    'professor': 'Profesor',
    'coordinator': 'Coordinador',
  };

  return roleMap[sidebarRole] || 'Estudiante';
}

