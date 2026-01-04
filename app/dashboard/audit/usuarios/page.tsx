import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function UsuariosAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Usuarios"
        entityDescription="Registro completo de todas las acciones realizadas sobre los usuarios del sistema"
        defaultTab="usuarios-creados"
        operations={[
          {
            label: 'Creados',
            auditType: 'usuarios-creados',
            title: 'Usuarios Creados',
            description: 'Registro completo de todos los usuarios creados en el sistema',
            emptyMessage: 'No se encontraron usuarios creados'
          },
          {
            label: 'Actualizados',
            auditType: 'usuarios-actualizados-campos',
            title: 'Usuarios Actualizados',
            description: 'Registro completo de todos los cambios realizados en los usuarios',
            emptyMessage: 'No se encontraron usuarios actualizados'
          },
          {
            label: 'Eliminados',
            auditType: 'usuarios-eliminados',
            title: 'Usuarios Eliminados',
            description: 'Registro completo de todos los usuarios eliminados del sistema',
            emptyMessage: 'No se encontraron usuarios eliminados'
          }
        ]}
      />
    </div>
  );
}
