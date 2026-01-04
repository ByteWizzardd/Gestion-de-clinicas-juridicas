import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function CondicionesActividadAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Condiciones de Actividad"
        entityDescription="Registro completo de todas las acciones realizadas sobre las condiciones de actividad del sistema"
        defaultTab="condiciones-actividad-eliminadas"
        operations={[
          {
            label: 'Eliminadas',
            auditType: 'condiciones-actividad-eliminadas',
            title: 'Condiciones de Actividad Eliminadas',
            description: 'Registro completo de todas las condiciones de actividad eliminadas del sistema',
            emptyMessage: 'No se encontraron condiciones de actividad eliminadas'
          },
          {
            label: 'Actualizadas',
            auditType: 'condiciones-actividad-actualizadas',
            title: 'Condiciones de Actividad Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las condiciones de actividad',
            emptyMessage: 'No se encontraron condiciones de actividad actualizadas'
          }
        ]}
      />
    </div>
  );
}
