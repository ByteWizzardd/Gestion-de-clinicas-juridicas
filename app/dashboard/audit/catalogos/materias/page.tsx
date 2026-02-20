import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function MateriaAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditEntityDetailClient
        entityTitle="Materias"
        entityDescription="Registro completo de todas las acciones realizadas sobre los materias del sistema"
        defaultTab="materias-insertadas"
        operations={[
          {
            label: 'Creados',
            auditType: 'materias-insertadas',
            title: 'Materias Creadas',
            description: 'Registro completo de todas las materias creadas en el sistema',
            emptyMessage: 'No se encontraron materias creadas'
          },
          {
            label: 'Actualizados',
            auditType: 'materias-actualizadas',
            title: 'Materias Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las materias',
            emptyMessage: 'No se encontraron materias actualizadas'
          },
          {
            label: 'Eliminados',
            auditType: 'materias-eliminadas',
            title: 'Materias Eliminadas',
            description: 'Registro completo de todas las materias eliminadas del sistema',
            emptyMessage: 'No se encontraron materias eliminadas'
          }
        ]}
      />
    </div>
  );
}
