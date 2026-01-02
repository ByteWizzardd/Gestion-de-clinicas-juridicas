import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditDetailClient from '@/components/audit/detail/AuditDetailClient';

export const dynamic = 'force-dynamic';

export default async function SoportesAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditDetailClient
        title="Soportes Eliminados"
        description="Registro completo de todos los documentos y archivos eliminados del sistema"
        auditType="soportes"
        emptyMessage="No se encontraron soportes eliminados"
      />
    </div>
  );
}
