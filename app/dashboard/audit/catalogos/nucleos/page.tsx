import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function NucleosAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Núcleos"
        entityDescription="Registro completo de todas las acciones realizadas sobre los núcleos del sistema"
        defaultTab="nucleos-eliminados"
        operations={[
          {
            label: 'Eliminados',
            auditType: 'nucleos-eliminados',
            title: 'Núcleos Eliminados',
            description: 'Registro completo de todos los núcleos eliminados del sistema',
            emptyMessage: 'No se encontraron núcleos eliminados'
          },
          {
            label: 'Actualizados',
            auditType: 'nucleos-actualizados',
            title: 'Núcleos Actualizados',
            description: 'Registro completo de todos los cambios realizados en los núcleos',
            emptyMessage: 'No se encontraron núcleos actualizados'
          }
        ]}
      />
    </div>
  );
}
