import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditDetailClient from '@/components/audit/detail/AuditDetailClient';

export const dynamic = 'force-dynamic';

export default async function UsuariosEliminadosAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditDetailClient
        title="Usuarios Deshabilitados"
        description="Registro completo de todos los usuarios deshabilitados del sistema"
        auditType="usuarios-eliminados"
        emptyMessage="No se encontraron usuarios deshabilitados"
      />
    </div>
  );
}
