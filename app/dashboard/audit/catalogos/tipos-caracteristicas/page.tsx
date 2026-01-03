import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function TiposCaracteristicasAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Tipos de Características"
        entityDescription="Registro completo de todas las acciones realizadas sobre los tipos de características del sistema"
        defaultTab="tipos-caracteristicas-eliminados"
        operations={[
          {
            label: 'Eliminados',
            auditType: 'tipos-caracteristicas-eliminados',
            title: 'Tipos de Características Eliminados',
            description: 'Registro completo de todos los tipos de características eliminados del sistema',
            emptyMessage: 'No se encontraron tipos de características eliminados'
          },
          {
            label: 'Actualizados',
            auditType: 'tipos-caracteristicas-actualizados',
            title: 'Tipos de Características Actualizados',
            description: 'Registro completo de todos los cambios realizados en los tipos de características',
            emptyMessage: 'No se encontraron tipos de características actualizados'
          }
        ]}
      />
    </div>
  );
}
