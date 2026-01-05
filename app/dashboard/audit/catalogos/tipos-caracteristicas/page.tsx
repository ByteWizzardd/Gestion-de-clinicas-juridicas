import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function TipoCaracterísticaAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Tipos Características"
        entityDescription="Registro completo de todas las acciones realizadas sobre los tipos caracteristicas del sistema"
        defaultTab="tipos-caracteristicas-insertados"
        operations={[
          {
            label: 'Creados',
            auditType: 'tipos-caracteristicas-insertados',
            title: 'Tipos Características Creados',
            description: 'Registro completo de todos los tipos caracteristicas creados en el sistema',
            emptyMessage: 'No se encontraron tipos caracteristicas creados'
          },
          {
            label: 'Actualizados',
            auditType: 'tipos-caracteristicas-actualizados',
            title: 'Tipos Características Actualizados',
            description: 'Registro completo de todos los cambios realizados en los tipos caracteristicas',
            emptyMessage: 'No se encontraron tipos caracteristicas actualizados'
          },
          {
            label: 'Eliminados',
            auditType: 'tipos-caracteristicas-eliminados',
            title: 'Tipos Características Eliminados',
            description: 'Registro completo de todos los tipos caracteristicas eliminados del sistema',
            emptyMessage: 'No se encontraron tipos caracteristicas eliminados'
          }
        ]}
      />
    </div>
  );
}
