import { authorizeRole } from '@/lib/utils/auth-utils';
import ReportsClient from '@/components/reports/ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    // Permitir solo a Coordinador y Profesores
    await authorizeRole(['coordinator', 'professor']);

    return <ReportsClient />;
}

