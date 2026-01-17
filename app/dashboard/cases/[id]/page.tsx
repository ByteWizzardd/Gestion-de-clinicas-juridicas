import { authorizeRole } from '@/lib/utils/auth-utils';
import CaseDetailClient from '@/components/cases/CaseDetailClient';

export const dynamic = 'force-dynamic';

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Permitir a todos los roles autenticados
    await authorizeRole(['coordinator', 'professor', 'student']);

    // Await params for Next.js 15 compatibility
    const { id } = await params;

    return <CaseDetailClient id={id} />;
}
