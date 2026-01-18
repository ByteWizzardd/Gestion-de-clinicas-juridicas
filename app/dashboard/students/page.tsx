import { authorizeRole } from '@/lib/utils/auth-utils';
import StudentsClient from '@/components/students/StudentsClient';

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
    // Solo permitir a Profesores
    await authorizeRole(['professor']);

    return <StudentsClient />;
}
