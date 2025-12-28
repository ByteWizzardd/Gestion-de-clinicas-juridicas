import { getCurrentUserAction } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/components/sidebar/menu-config';
import { mapSystemRoleToSidebarRole } from './role-mapper';

/**
 * Verifica si el usuario actual tiene uno de los roles permitidos.
 * Si no está autenticado, redirige al login.
 * Si no tiene el rol permitido, redirige al dashboard.
 * 
 * @param allowedRoles Array de roles permitidos (coordinator, professor, student)
 * @returns El objeto del usuario si está autorizado
 */
export async function authorizeRole(allowedRoles: UserRole[]) {
  const result = await getCurrentUserAction();

  if (!result.success || !result.data) {
    redirect('/auth/login');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(result.data.rol);

  if (!allowedRoles.includes(userSidebarRole)) {
    redirect('/dashboard');
  }

  return result.data;
}

