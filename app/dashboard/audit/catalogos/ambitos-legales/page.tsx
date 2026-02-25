import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function ÁmbitoLegalAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditEntityDetailClient
        entityTitle="Auditoría de Ámbitos Legales"
        entityDescription="Registro completo de todas las acciones realizadas sobre los ambitos legales del sistema"
        defaultTab="ambitos-legales-insertados"
        hideMainHeader={true}
        operations={[
          {
            label: 'Creados',
            auditType: 'ambitos-legales-insertados',
            title: 'Ámbitos Legales Creados',
            description: 'Registro completo de todos los ambitos legales creados en el sistema',
            emptyMessage: 'No se encontraron ambitos legales creados'
          },
          {
            label: 'Actualizados',
            auditType: 'ambitos-legales-actualizados',
            title: 'Ámbitos Legales Actualizados',
            description: 'Registro completo de todos los cambios realizados en los ambitos legales',
            emptyMessage: 'No se encontraron ambitos legales actualizados'
          },
          {
            label: 'Eliminados',
            auditType: 'ambitos-legales-eliminados',
            title: 'Ámbitos Legales Eliminados',
            description: 'Registro completo de todos los ambitos legales eliminados del sistema',
            emptyMessage: 'No se encontraron ambitos legales eliminados'
          }
        ]}
      />
    </div>
  );
}
