import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function ReportesAuditPage() {
    await authorizeRole(['coordinator']);

    return (
        <div>
            <AuditEntityDetailClient
                entityTitle="Auditoría de Reportes"
                entityDescription="Registro completo de todos los reportes generados en el sistema"
                defaultTab="reportes-generados"
                hideMainHeader={true}
                operations={[
                    {
                        label: 'Generados',
                        auditType: 'reportes-generados',
                        title: 'Reportes Generados',
                        description: 'Registro cronológico e inmutable de todos los reportes generados',
                        emptyMessage: 'No se encontraron reportes generados'
                    },
                    {
                        label: 'Vistas Previas',
                        auditType: 'reportes-vista-previa',
                        title: 'Vistas Previas de Reportes',
                        description: 'Registro cronológico de todas las vistas previas de reportes',
                        emptyMessage: 'No se encontraron vistas previas de reportes'
                    }
                ]}
            />
        </div>
    );
}
