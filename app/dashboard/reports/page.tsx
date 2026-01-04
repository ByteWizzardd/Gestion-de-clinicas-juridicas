import { authorizeRole } from '@/lib/utils/auth-utils';
import ReportsClient from '@/components/reports/ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    // Permitir a Coordinador, Profesores y Estudiantes
    await authorizeRole(['coordinator', 'professor', 'student']);

    return <ReportsClient />;
}

