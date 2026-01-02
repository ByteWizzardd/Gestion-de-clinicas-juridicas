import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/components/sidebar/menu-config';
import { mapSystemRoleToSidebarRole } from './role-mapper';

/**
 * Verifica si el usuario actual tiene uno de los roles permitidos.
 * Si no está autenticado, redirige al login.
 * Si no tiene el rol permitido, redirige al dashboard.
 * 
 * Esta función es optimizada y NO consulta la base de datos para obtener la foto de perfil,
 * solo verifica el token JWT y el rol. Esto evita consultas innecesarias cuando el layout
 * ya ha obtenido la información completa del usuario.
 * 
 * @param allowedRoles Array de roles permitidos (coordinator, professor, student)
 * @returns El objeto del usuario del token si está autorizado
 */
export async function authorizeRole(allowedRoles: UserRole[]) {
  const authResult = await requireAuthInServerActionWithCode();

  if (!authResult.success || !authResult.user) {
    redirect('/auth/login');
  }

  const userSidebarRole = mapSystemRoleToSidebarRole(authResult.user.rol);

  if (!allowedRoles.includes(userSidebarRole)) {
    redirect('/dashboard');
  }

  // Retornar los datos básicos del token (sin foto de perfil)
  // Nota: El token JWT solo contiene cedula y rol, no nombres, apellidos ni correo
  return {
    cedula: authResult.user.cedula,
    rol: authResult.user.rol,
  };
}

