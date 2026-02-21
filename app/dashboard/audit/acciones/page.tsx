import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function AccionesAuditPage() {
    await authorizeRole(['coordinator']);

    return (
        <div>
            <AuditEntityDetailClient
                entityTitle="Auditoría de Acciones"
                entityDescription="Registro completo de todas las acciones de seguimiento realizadas sobre los casos"
                defaultTab="acciones-creadas"
                operations={[
                    {
                        label: 'Creadas',
                        auditType: 'acciones-creadas',
                        title: 'Acciones Creadas',
                        description: 'Registro completo de todas las acciones de seguimiento creadas en el sistema',
                        emptyMessage: 'No se encontraron acciones creadas'
                    },
                    {
                        label: 'Actualizadas',
                        auditType: 'acciones-actualizadas',
                        title: 'Acciones Actualizadas',
                        description: 'Registro completo de todos los cambios realizados en las acciones de seguimiento',
                        emptyMessage: 'No se encontraron acciones actualizadas'
                    },
                    {
                        label: 'Eliminadas',
                        auditType: 'acciones-eliminadas',
                        title: 'Acciones Eliminadas',
                        description: 'Registro completo de todas las acciones de seguimiento eliminadas del sistema',
                        emptyMessage: 'No se encontraron acciones eliminadas'
                    }
                ]}
            />
        </div>
    );
}
