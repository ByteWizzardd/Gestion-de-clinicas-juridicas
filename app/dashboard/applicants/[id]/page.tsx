import { authorizeRole } from '@/lib/utils/auth-utils';
import ApplicantDetailClient from '@/components/applicants/ApplicantDetailClient';

export const dynamic = 'force-dynamic';

export default async function ApplicantDetailPage() {
    // Permitir a todos los roles autenticados
    await authorizeRole(['coordinator', 'professor', 'student']);

    return <ApplicantDetailClient />;
}
