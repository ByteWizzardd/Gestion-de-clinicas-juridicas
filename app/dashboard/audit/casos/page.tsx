import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditCasesTabs from './AuditCasesTabs';

export const dynamic = 'force-dynamic';

export default async function AuditCasesPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    // Solo permitir al Coordinador
    await authorizeRole(['coordinator']);

    const params = await searchParams;
    const activeTab = params.tab || 'casos-creados';

    return <AuditCasesTabs defaultTab={activeTab} />;
}
