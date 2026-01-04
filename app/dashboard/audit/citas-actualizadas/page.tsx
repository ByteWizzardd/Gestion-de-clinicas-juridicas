import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditDetailClient from '@/components/audit/detail/AuditDetailClient';

export const dynamic = 'force-dynamic';

export default async function CitasActualizadasAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditDetailClient
        title="Citas Actualizadas"
        description="Registro completo de todos los cambios realizados en las citas"
        auditType="citas-actualizadas"
        emptyMessage="No se encontraron citas actualizadas"
      />
    </div>
  );
}
