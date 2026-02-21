import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function CondiciónActividadAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditEntityDetailClient
        entityTitle="Auditoría de Condiciones Actividad"
        entityDescription="Registro completo de todas las acciones realizadas sobre los condiciones actividad del sistema"
        defaultTab="condiciones-actividad-insertadas"
        operations={[
          {
            label: 'Creados',
            auditType: 'condiciones-actividad-insertadas',
            title: 'Condiciones Actividad Creadas',
            description: 'Registro completo de todas las condiciones de actividad creadas en el sistema',
            emptyMessage: 'No se encontraron condiciones de actividad creadas'
          },
          {
            label: 'Actualizados',
            auditType: 'condiciones-actividad-actualizadas',
            title: 'Condiciones Actividad Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las condiciones de actividad',
            emptyMessage: 'No se encontraron condiciones de actividad actualizadas'
          },
          {
            label: 'Eliminados',
            auditType: 'condiciones-actividad-eliminadas',
            title: 'Condiciones Actividad Eliminadas',
            description: 'Registro completo de todas las condiciones de actividad eliminadas del sistema',
            emptyMessage: 'No se encontraron condiciones de actividad eliminadas'
          }
        ]}
      />
    </div>
  );
}
