import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function BeneficiariosAuditPage() {
    await authorizeRole(['coordinator']);

    return (
        <div>
            <AuditEntityDetailClient
                entityTitle="Beneficiarios"
                entityDescription="Registro completo de todas las acciones realizadas sobre los beneficiarios de los casos"
                defaultTab="beneficiarios-creados"
                operations={[
                    {
                        label: 'Creados',
                        auditType: 'beneficiarios-creados',
                        title: 'Beneficiarios Creados',
                        description: 'Registro completo de todos los beneficiarios inscritos en casos',
                        emptyMessage: 'No se encontraron beneficiarios creados'
                    },
                    {
                        label: 'Actualizados',
                        auditType: 'beneficiarios-actualizados',
                        title: 'Beneficiarios Actualizados',
                        description: 'Registro completo de todos los cambios realizados en los beneficiarios',
                        emptyMessage: 'No se encontraron beneficiarios actualizados'
                    },
                    {
                        label: 'Eliminados',
                        auditType: 'beneficiarios-eliminados',
                        title: 'Beneficiarios Eliminados',
                        description: 'Registro completo de todos los beneficiarios eliminados de casos',
                        emptyMessage: 'No se encontraron beneficiarios eliminados'
                    }
                ]}
            />
        </div>
    );
}
