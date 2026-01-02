import { authorizeRole } from '@/lib/utils/auth-utils';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
    // Solo permitir a Profesores
    await authorizeRole(['professor']);

    return (
        <div>
            <h1>Gestión de Equipo</h1>
            <p>Esta es la página para que los profesores gestionen su equipo de estudiantes.</p>
        </div>
    );
}

