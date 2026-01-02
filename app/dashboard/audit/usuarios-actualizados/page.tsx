import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditDetailClient from '@/components/audit/detail/AuditDetailClient';

export const dynamic = 'force-dynamic';

export default async function UsuariosActualizadosAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditDetailClient
        title="Cambios de Tipo de Usuario"
        description="Registro completo de todos los cambios en los tipos de usuario"
        auditType="usuarios-actualizados"
        emptyMessage="No se encontraron cambios de tipo de usuario"
      />
    </div>
  );
}
