import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditDetailClient from '@/components/audit/detail/AuditDetailClient';

export const dynamic = 'force-dynamic';

export default async function UsuariosEliminadosAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditDetailClient
        title="Usuarios Eliminados"
        description="Registro completo de todos los usuarios eliminados del sistema"
        auditType="usuarios-eliminados"
        emptyMessage="No se encontraron usuarios eliminados"
      />
    </div>
  );
}
