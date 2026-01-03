import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function ParroquiasAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Parroquias"
        entityDescription="Registro completo de todas las acciones realizadas sobre las parroquias del sistema"
        defaultTab="parroquias-eliminadas"
        operations={[
          {
            label: 'Eliminadas',
            auditType: 'parroquias-eliminadas',
            title: 'Parroquias Eliminadas',
            description: 'Registro completo de todas las parroquias eliminadas del sistema',
            emptyMessage: 'No se encontraron parroquias eliminadas'
          },
          {
            label: 'Actualizadas',
            auditType: 'parroquias-actualizadas',
            title: 'Parroquias Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las parroquias',
            emptyMessage: 'No se encontraron parroquias actualizadas'
          }
        ]}
      />
    </div>
  );
}
