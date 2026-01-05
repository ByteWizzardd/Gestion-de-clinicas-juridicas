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
            label: 'Deshabilitados',
            auditType: 'usuarios-eliminados',
            title: 'Usuarios Deshabilitados',
            description: 'Registro completo de todos los usuarios deshabilitados del sistema',
            emptyMessage: 'No se encontraron usuarios deshabilitados'
          },
          {
            label: 'Reactivados',
            auditType: 'usuarios-habilitados',
            title: 'Usuarios Reactivados',
            description: 'Registro completo de todos los usuarios reactivados (habilitados) en el sistema',
            emptyMessage: 'No se encontraron usuarios reactivados'
          }
        ]}
      />
    </div>
  );
}
