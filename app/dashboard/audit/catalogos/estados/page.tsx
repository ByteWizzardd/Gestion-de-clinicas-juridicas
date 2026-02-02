import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function EstadosAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Estados"
        entityDescription="Registro completo de todas las acciones realizadas sobre los estados del sistema"
        defaultTab="estados-insertados"
        operations={[
          {
            label: 'Creados',
            auditType: 'estados-insertados',
            title: 'Estados Creados',
            description: 'Registro completo de todos los estados creados en el sistema',
            emptyMessage: 'No se encontraron estados creados'
          },
          {
            label: 'Actualizados',
            auditType: 'estados-actualizados',
            title: 'Estados Actualizados',
            description: 'Registro completo de todos los cambios realizados en los estados',
            emptyMessage: 'No se encontraron estados actualizados'
          },
          {
            label: 'Eliminados',
            auditType: 'estados-eliminados',
            title: 'Estados Eliminados',
            description: 'Registro completo de todos los estados eliminados del sistema',
            emptyMessage: 'No se encontraron estados eliminados'
          }
        ]}
      />
    </div>
  );
}
