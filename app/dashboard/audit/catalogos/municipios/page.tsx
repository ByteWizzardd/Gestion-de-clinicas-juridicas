import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function MunicipiosAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Municipios"
        entityDescription="Registro completo de todas las acciones realizadas sobre los municipios del sistema"
        defaultTab="municipios-eliminados"
        operations={[
          {
            label: 'Eliminados',
            auditType: 'municipios-eliminados',
            title: 'Municipios Eliminados',
            description: 'Registro completo de todos los municipios eliminados del sistema',
            emptyMessage: 'No se encontraron municipios eliminados'
          },
          {
            label: 'Actualizados',
            auditType: 'municipios-actualizados',
            title: 'Municipios Actualizados',
            description: 'Registro completo de todos los cambios realizados en los municipios',
            emptyMessage: 'No se encontraron municipios actualizados'
          }
        ]}
      />
    </div>
  );
}
