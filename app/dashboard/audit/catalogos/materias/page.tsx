import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function MateriasAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Materias"
        entityDescription="Registro completo de todas las acciones realizadas sobre las materias del sistema"
        defaultTab="materias-eliminadas"
        operations={[
          {
            label: 'Eliminadas',
            auditType: 'materias-eliminadas',
            title: 'Materias Eliminadas',
            description: 'Registro completo de todas las materias eliminadas del sistema',
            emptyMessage: 'No se encontraron materias eliminadas'
          },
          {
            label: 'Actualizadas',
            auditType: 'materias-actualizadas',
            title: 'Materias Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las materias',
            emptyMessage: 'No se encontraron materias actualizadas'
          }
        ]}
      />
    </div>
  );
}
