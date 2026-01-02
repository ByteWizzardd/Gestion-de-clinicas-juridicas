import { authorizeRole } from '@/lib/utils/auth-utils';
import NotificationsClient from '@/components/profile/NotificationsClient';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  await authorizeRole(['coordinator', 'professor', 'student']);
  return <NotificationsClient />;
}
