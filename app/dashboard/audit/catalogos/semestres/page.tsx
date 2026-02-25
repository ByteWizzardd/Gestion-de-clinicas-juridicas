import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function SemestreAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditEntityDetailClient
        entityTitle="Auditoría de Semestres"
        entityDescription="Registro completo de todas las acciones realizadas sobre los semestres del sistema"
        defaultTab="semestres-insertados"
        hideMainHeader={true}
        operations={[
          {
            label: 'Creados',
            auditType: 'semestres-insertados',
            title: 'Semestres Creados',
            description: 'Registro completo de todos los semestres creados en el sistema',
            emptyMessage: 'No se encontraron semestres creados'
          },
          {
            label: 'Actualizados',
            auditType: 'semestres-actualizados',
            title: 'Semestres Actualizados',
            description: 'Registro completo de todos los cambios realizados en los semestres',
            emptyMessage: 'No se encontraron semestres actualizados'
          },
          {
            label: 'Eliminados',
            auditType: 'semestres-eliminados',
            title: 'Semestres Eliminados',
            description: 'Registro completo de todos los semestres eliminados del sistema',
            emptyMessage: 'No se encontraron semestres eliminados'
          }
        ]}
      />
    </div>
  );
}
