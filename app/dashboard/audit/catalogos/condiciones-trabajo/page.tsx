import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function CondiciónTrabajoAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Condiciones Trabajo"
        entityDescription="Registro completo de todas las acciones realizadas sobre los condiciones trabajo del sistema"
        defaultTab="condiciones-trabajo-insertadas"
        operations={[
          {
            label: 'Creados',
            auditType: 'condiciones-trabajo-insertadas',
            title: 'Condiciones Trabajo Creadas',
            description: 'Registro completo de todas las condiciones de trabajo creadas en el sistema',
            emptyMessage: 'No se encontraron condiciones de trabajo creadas'
          },
          {
            label: 'Actualizados',
            auditType: 'condiciones-trabajo-actualizadas',
            title: 'Condiciones Trabajo Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las condiciones de trabajo',
            emptyMessage: 'No se encontraron condiciones de trabajo actualizadas'
          },
          {
            label: 'Eliminados',
            auditType: 'condiciones-trabajo-eliminadas',
            title: 'Condiciones Trabajo Eliminadas',
            description: 'Registro completo de todas las condiciones de trabajo eliminadas del sistema',
            emptyMessage: 'No se encontraron condiciones de trabajo eliminadas'
          }
        ]}
      />
    </div>
  );
}
