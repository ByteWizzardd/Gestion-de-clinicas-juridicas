import { authorizeRole } from '@/lib/utils/auth-utils';
import CaseDetailClient from '@/components/cases/CaseDetailClient';

export const dynamic = 'force-dynamic';

export default async function CaseDetailPage() {
    // Permitir a todos los roles autenticados
    await authorizeRole(['coordinator', 'professor', 'student']);

    return <CaseDetailClient />;
}
