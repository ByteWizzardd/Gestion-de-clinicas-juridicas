import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function CitasAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditEntityDetailClient
        entityTitle="Auditoría de Citas"
        entityDescription="Registro completo de todas las acciones realizadas sobre las citas del sistema"
        defaultTab="citas-creadas"
        hideMainHeader={true}
        operations={[
          {
            label: 'Creadas',
            auditType: 'citas-creadas',
            title: 'Citas Creadas',
            description: 'Registro completo de todas las citas creadas en el sistema',
            emptyMessage: 'No se encontraron citas creadas'
          },
          {
            label: 'Actualizadas',
            auditType: 'citas-actualizadas',
            title: 'Citas Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las citas',
            emptyMessage: 'No se encontraron citas actualizadas'
          },
          {
            label: 'Eliminadas',
            auditType: 'citas-eliminadas',
            title: 'Citas Eliminadas',
            description: 'Registro completo de todas las citas eliminadas del sistema',
            emptyMessage: 'No se encontraron citas eliminadas'
          }
        ]}
      />
    </div>
  );
}
