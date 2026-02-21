import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function SubcategoríaAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditEntityDetailClient
        entityTitle="Auditoría de Subcategorías"
        entityDescription="Registro completo de todas las acciones realizadas sobre los subcategorias del sistema"
        defaultTab="subcategorias-insertadas"
        operations={[
          {
            label: 'Creados',
            auditType: 'subcategorias-insertadas',
            title: 'Subcategorías Creadas',
            description: 'Registro completo de todas las subcategorías creadas en el sistema',
            emptyMessage: 'No se encontraron subcategorías creadas'
          },
          {
            label: 'Actualizados',
            auditType: 'subcategorias-actualizadas',
            title: 'Subcategorías Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las subcategorías',
            emptyMessage: 'No se encontraron subcategorías actualizadas'
          },
          {
            label: 'Eliminados',
            auditType: 'subcategorias-eliminadas',
            title: 'Subcategorías Eliminadas',
            description: 'Registro completo de todas las subcategorías eliminadas del sistema',
            emptyMessage: 'No se encontraron subcategorías eliminadas'
          }
        ]}
      />
    </div>
  );
}
