import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function NúcleoAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditEntityDetailClient
        entityTitle="Auditoría de Núcleos"
        entityDescription="Registro completo de todas las acciones realizadas sobre los nucleos del sistema"
        defaultTab="nucleos-insertados"
        hideMainHeader={true}
        operations={[
          {
            label: 'Creados',
            auditType: 'nucleos-insertados',
            title: 'Núcleos Creados',
            description: 'Registro completo de todos los nucleos creados en el sistema',
            emptyMessage: 'No se encontraron nucleos creados'
          },
          {
            label: 'Actualizados',
            auditType: 'nucleos-actualizados',
            title: 'Núcleos Actualizados',
            description: 'Registro completo de todos los cambios realizados en los nucleos',
            emptyMessage: 'No se encontraron nucleos actualizados'
          },
          {
            label: 'Eliminados',
            auditType: 'nucleos-eliminados',
            title: 'Núcleos Eliminados',
            description: 'Registro completo de todos los nucleos eliminados del sistema',
            emptyMessage: 'No se encontraron nucleos eliminados'
          }
        ]}
      />
    </div>
  );
}
