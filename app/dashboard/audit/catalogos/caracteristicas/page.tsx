import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function CaracterísticaAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditEntityDetailClient
        entityTitle="Auditoría de Características"
        entityDescription="Registro completo de todas las acciones realizadas sobre los caracteristicas del sistema"
        defaultTab="caracteristicas-insertadas"
        hideMainHeader={true}
        operations={[
          {
            label: 'Creados',
            auditType: 'caracteristicas-insertadas',
            title: 'Características Creadas',
            description: 'Registro completo de todas las características creadas en el sistema',
            emptyMessage: 'No se encontraron características creadas'
          },
          {
            label: 'Actualizados',
            auditType: 'caracteristicas-actualizadas',
            title: 'Características Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las características',
            emptyMessage: 'No se encontraron características actualizadas'
          },
          {
            label: 'Eliminados',
            auditType: 'caracteristicas-eliminadas',
            title: 'Características Eliminadas',
            description: 'Registro completo de todas las características eliminadas del sistema',
            emptyMessage: 'No se encontraron características eliminadas'
          }
        ]}
      />
    </div>
  );
}
