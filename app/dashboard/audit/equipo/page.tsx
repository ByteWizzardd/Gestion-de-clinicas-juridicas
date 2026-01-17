import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function EquipoAuditPage() {
    await authorizeRole(['coordinator']);

    return (
        <div className="m-3">
            <AuditEntityDetailClient
                entityTitle="Equipo de Casos"
                entityDescription="Registro completo de cambios en la asignación de estudiantes y profesores a casos"
                defaultTab="equipos-actualizados"
                operations={[
                    {
                        label: 'Creados',
                        auditType: 'equipos-creados',
                        title: 'Equipos Creados',
                        description: 'Registro de asignaciones iniciales de estudiantes y profesores a casos',
                        emptyMessage: 'No se encontraron equipos creados'
                    },
                    {
                        label: 'Actualizados',
                        auditType: 'equipos-actualizados',
                        title: 'Equipos Actualizados',
                        description: 'Registro completo de todos los cambios en la asignación de estudiantes y profesores a casos',
                        emptyMessage: 'No se encontraron equipos actualizados'
                    }
                ]}
            />
        </div>
    );
}
