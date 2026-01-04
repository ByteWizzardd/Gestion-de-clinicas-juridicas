import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditDetailClient from '@/components/audit/detail/AuditDetailClient';

export const dynamic = 'force-dynamic';

export default async function UsuariosActualizadosCamposAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditDetailClient
        title="Usuarios Actualizados"
        description="Registro completo de todos los cambios en los campos de usuarios"
        auditType="usuarios-actualizados-campos"
        emptyMessage="No se encontraron usuarios actualizados"
      />
    </div>
  );
}
