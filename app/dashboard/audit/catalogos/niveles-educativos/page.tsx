import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function NivelEducativoAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Niveles Educativos"
        entityDescription="Registro completo de todas las acciones realizadas sobre los niveles educativos del sistema"
        defaultTab="niveles-educativos-insertados"
        operations={[
          {
            label: 'Creados',
            auditType: 'niveles-educativos-insertados',
            title: 'Niveles Educativos Creados',
            description: 'Registro completo de todos los niveles educativos creados en el sistema',
            emptyMessage: 'No se encontraron niveles educativos creados'
          },
          {
            label: 'Actualizados',
            auditType: 'niveles-educativos-actualizados',
            title: 'Niveles Educativos Actualizados',
            description: 'Registro completo de todos los cambios realizados en los niveles educativos',
            emptyMessage: 'No se encontraron niveles educativos actualizados'
          },
          {
            label: 'Eliminados',
            auditType: 'niveles-educativos-eliminados',
            title: 'Niveles Educativos Eliminados',
            description: 'Registro completo de todos los niveles educativos eliminados del sistema',
            emptyMessage: 'No se encontraron niveles educativos eliminados'
          }
        ]}
      />
    </div>
  );
}
