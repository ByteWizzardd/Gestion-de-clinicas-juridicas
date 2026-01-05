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
    const activeTab = params.tab || 'casos-eliminados';

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Auditoría de Casos</h1>
            <p className="mb-6 ml-3">Historial de movimientos de casos</p>

            <AuditCasesTabs defaultTab={activeTab} />
        </>
    );
}
