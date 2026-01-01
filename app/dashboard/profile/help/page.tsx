import { authorizeRole } from '@/lib/utils/auth-utils';
import HelpClient from '@/components/profile/HelpClient';

export const dynamic = 'force-dynamic';

export default async function HelpPage() {
  await authorizeRole(['coordinator', 'professor', 'student']);
  return <HelpClient />;
}
