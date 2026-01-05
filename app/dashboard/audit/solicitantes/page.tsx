import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function SolicitantesAuditPage() {
    await authorizeRole(['coordinator']);

    return (
        <div className="m-3">
            <AuditEntityDetailClient
                entityTitle="Solicitantes"
                entityDescription="Registro completo de todas las acciones realizadas sobre los solicitantes del sistema"
                defaultTab="solicitantes-creados"
                operations={[
                    {
                        label: 'Creados',
                        auditType: 'solicitantes-creados',
                        title: 'Solicitantes Creados',
                        description: 'Registro completo de todos los solicitantes creados en el sistema',
                        emptyMessage: 'No se encontraron solicitantes creados'
                    },
                    {
                        label: 'Actualizados',
                        auditType: 'solicitantes-actualizados',
                        title: 'Solicitantes Actualizados',
                        description: 'Registro completo de todos los cambios realizados en los solicitantes',
                        emptyMessage: 'No se encontraron solicitantes actualizados'
                    },
                    {
                        label: 'Eliminados',
                        auditType: 'solicitantes-eliminados',
                        title: 'Solicitantes Eliminados',
                        description: 'Registro completo de todos los solicitantes eliminados del sistema',
                        emptyMessage: 'No se encontraron solicitantes eliminados'
                    }
                ]}
            />
        </div>
    );
}
