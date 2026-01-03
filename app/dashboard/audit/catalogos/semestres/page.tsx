import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function SemestresAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Semestres"
        entityDescription="Registro completo de todas las acciones realizadas sobre los semestres del sistema"
        defaultTab="semestres-eliminados"
        operations={[
          {
            label: 'Eliminados',
            auditType: 'semestres-eliminados',
            title: 'Semestres Eliminados',
            description: 'Registro completo de todos los semestres eliminados del sistema',
            emptyMessage: 'No se encontraron semestres eliminados'
          },
          {
            label: 'Actualizados',
            auditType: 'semestres-actualizados',
            title: 'Semestres Actualizados',
            description: 'Registro completo de todos los cambios realizados en los semestres',
            emptyMessage: 'No se encontraron semestres actualizados'
          }
        ]}
      />
    </div>
  );
}
