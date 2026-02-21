import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function MunicipioAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditEntityDetailClient
        entityTitle="Auditoría de Municipios"
        entityDescription="Registro completo de todas las acciones realizadas sobre los municipios del sistema"
        defaultTab="municipios-insertados"
        operations={[
          {
            label: 'Creados',
            auditType: 'municipios-insertados',
            title: 'Municipios Creados',
            description: 'Registro completo de todos los municipios creados en el sistema',
            emptyMessage: 'No se encontraron municipios creados'
          },
          {
            label: 'Actualizados',
            auditType: 'municipios-actualizados',
            title: 'Municipios Actualizados',
            description: 'Registro completo de todos los cambios realizados en los municipios',
            emptyMessage: 'No se encontraron municipios actualizados'
          },
          {
            label: 'Eliminados',
            auditType: 'municipios-eliminados',
            title: 'Municipios Eliminados',
            description: 'Registro completo de todos los municipios eliminados del sistema',
            emptyMessage: 'No se encontraron municipios eliminados'
          }
        ]}
      />
    </div>
  );
}
