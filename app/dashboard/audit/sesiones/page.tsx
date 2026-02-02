import { authorizeRole } from '@/lib/utils/auth-utils';
import SesionesAuditClient from '@/components/audit/SesionesAuditClient';

export const dynamic = 'force-dynamic';

export default async function SesionesAuditPage() {
    await authorizeRole(['coordinator']);

    return (
        <div className="m-3">
            <SesionesAuditClient />
        </div>
    );
}
