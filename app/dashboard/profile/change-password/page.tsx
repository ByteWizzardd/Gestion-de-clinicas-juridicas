import { authorizeRole } from '@/lib/utils/auth-utils';
import ChangePasswordClient from '@/components/profile/ChangePasswordClient';

export const dynamic = 'force-dynamic';

export default async function ChangePasswordPage() {
  await authorizeRole(['coordinator', 'professor', 'student']);
  return <ChangePasswordClient />;
}
