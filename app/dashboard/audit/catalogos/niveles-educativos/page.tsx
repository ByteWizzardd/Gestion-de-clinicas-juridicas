import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function NivelesEducativosAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Niveles Educativos"
        entityDescription="Registro completo de todas las acciones realizadas sobre los niveles educativos del sistema"
        defaultTab="niveles-educativos-eliminados"
        operations={[
          {
            label: 'Eliminados',
            auditType: 'niveles-educativos-eliminados',
            title: 'Niveles Educativos Eliminados',
            description: 'Registro completo de todos los niveles educativos eliminados del sistema',
            emptyMessage: 'No se encontraron niveles educativos eliminados'
          },
          {
            label: 'Actualizados',
            auditType: 'niveles-educativos-actualizados',
            title: 'Niveles Educativos Actualizados',
            description: 'Registro completo de todos los cambios realizados en los niveles educativos',
            emptyMessage: 'No se encontraron niveles educativos actualizados'
          }
        ]}
      />
    </div>
  );
}
