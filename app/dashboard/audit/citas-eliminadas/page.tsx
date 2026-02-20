import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditDetailClient from '@/components/audit/detail/AuditDetailClient';

export const dynamic = 'force-dynamic';

export default async function CitasEliminadasAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditDetailClient
        title="Citas Eliminadas"
        description="Registro completo de todas las citas eliminadas del sistema"
        auditType="citas-eliminadas"
        emptyMessage="No se encontraron citas eliminadas"
      />
    </div>
  );
}
