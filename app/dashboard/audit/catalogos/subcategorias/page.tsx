import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function SubcategoriasAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Subcategorías"
        entityDescription="Registro completo de todas las acciones realizadas sobre las subcategorías del sistema"
        defaultTab="subcategorias-eliminadas"
        operations={[
          {
            label: 'Eliminadas',
            auditType: 'subcategorias-eliminadas',
            title: 'Subcategorías Eliminadas',
            description: 'Registro completo de todas las subcategorías eliminadas del sistema',
            emptyMessage: 'No se encontraron subcategorías eliminadas'
          },
          {
            label: 'Actualizadas',
            auditType: 'subcategorias-actualizadas',
            title: 'Subcategorías Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las subcategorías',
            emptyMessage: 'No se encontraron subcategorías actualizadas'
          }
        ]}
      />
    </div>
  );
}
