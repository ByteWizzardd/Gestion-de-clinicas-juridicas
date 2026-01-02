import { authorizeRole } from '@/lib/utils/auth-utils';
import { getCurrentUserAction } from '@/app/actions/auth';
import ProfileClient from '@/components/profile/ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  // Permitir a todos los roles autenticados
  await authorizeRole(['coordinator', 'professor', 'student']);

  // Obtener datos del usuario actual
  const userResult = await getCurrentUserAction();
  const user = userResult.success ? userResult.data : null;

  return <ProfileClient initialUser={user} />;
}
