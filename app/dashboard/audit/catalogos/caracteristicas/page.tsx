import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function CaracteristicasAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Características"
        entityDescription="Registro completo de todas las acciones realizadas sobre las características del sistema"
        defaultTab="caracteristicas-eliminadas"
        operations={[
          {
            label: 'Eliminadas',
            auditType: 'caracteristicas-eliminadas',
            title: 'Características Eliminadas',
            description: 'Registro completo de todas las características eliminadas del sistema',
            emptyMessage: 'No se encontraron características eliminadas'
          },
          {
            label: 'Actualizadas',
            auditType: 'caracteristicas-actualizadas',
            title: 'Características Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las características',
            emptyMessage: 'No se encontraron características actualizadas'
          }
        ]}
      />
    </div>
  );
}
