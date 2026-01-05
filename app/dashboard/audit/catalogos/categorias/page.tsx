import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function CategoríaAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Categorías"
        entityDescription="Registro completo de todas las acciones realizadas sobre los categorias del sistema"
        defaultTab="categorias-insertadas"
        operations={[
          {
            label: 'Creados',
            auditType: 'categorias-insertadas',
            title: 'Categorías Creadas',
            description: 'Registro completo de todas las categorías creadas en el sistema',
            emptyMessage: 'No se encontraron categorías creadas'
          },
          {
            label: 'Actualizados',
            auditType: 'categorias-actualizadas',
            title: 'Categorías Actualizadas',
            description: 'Registro completo de todos los cambios realizados en las categorías',
            emptyMessage: 'No se encontraron categorías actualizadas'
          },
          {
            label: 'Eliminados',
            auditType: 'categorias-eliminadas',
            title: 'Categorías Eliminadas',
            description: 'Registro completo de todas las categorías eliminadas del sistema',
            emptyMessage: 'No se encontraron categorías eliminadas'
          }
        ]}
      />
    </div>
  );
}
