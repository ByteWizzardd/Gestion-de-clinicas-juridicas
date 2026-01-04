import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function AmbitosLegalesAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Ámbitos Legales"
        entityDescription="Registro completo de todas las acciones realizadas sobre los ámbitos legales del sistema"
        defaultTab="ambitos-legales-eliminados"
        operations={[
          {
            label: 'Eliminados',
            auditType: 'ambitos-legales-eliminados',
            title: 'Ámbitos Legales Eliminados',
            description: 'Registro completo de todos los ámbitos legales eliminados del sistema',
            emptyMessage: 'No se encontraron ámbitos legales eliminados'
          },
          {
            label: 'Actualizados',
            auditType: 'ambitos-legales-actualizados',
            title: 'Ámbitos Legales Actualizados',
            description: 'Registro completo de todos los cambios realizados en los ámbitos legales',
            emptyMessage: 'No se encontraron ámbitos legales actualizados'
          }
        ]}
      />
    </div>
  );
}
