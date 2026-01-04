import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function CondicionesTrabajoAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Condiciones de Trabajo"
        entityDescription="Registro completo de todas las acciones realizadas sobre las condiciones de trabajo del sistema"
        defaultTab="condiciones-trabajo-eliminadas"
        operations={[
          {
            label: 'Eliminadas',
            auditType: 'condiciones-trabajo-eliminadas',
            title: 'Condiciones de Trabajo Eliminadas',
            description: 'Registro completo de todas las condiciones de trabajo eliminadas del sistema',
            emptyMessage: 'No se encontraron condiciones de trabajo eliminadas'
          },
          {
            label: 'Actualizadas',
            auditType: 'condiciones-trabajo-actualizadas',
            title: 'Condiciones de Trabajo Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las condiciones de trabajo',
            emptyMessage: 'No se encontraron condiciones de trabajo actualizadas'
          }
        ]}
      />
    </div>
  );
}
