import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditClient from '@/components/audit/AuditClient';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  // Solo permitir al Coordinador
  await authorizeRole(['coordinator']);

  return <AuditClient />;
}
