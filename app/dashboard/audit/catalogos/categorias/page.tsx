import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function CategoriasAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Categorías"
        entityDescription="Registro completo de todas las acciones realizadas sobre las categorías del sistema"
        defaultTab="categorias-eliminadas"
        operations={[
          {
            label: 'Eliminadas',
            auditType: 'categorias-eliminadas',
            title: 'Categorías Eliminadas',
            description: 'Registro completo de todas las categorías eliminadas del sistema',
            emptyMessage: 'No se encontraron categorías eliminadas'
          },
          {
            label: 'Actualizadas',
            auditType: 'categorias-actualizadas',
            title: 'Categorías Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las categorías',
            emptyMessage: 'No se encontraron categorías actualizadas'
          }
        ]}
      />
    </div>
  );
}
