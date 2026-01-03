import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function SoportesAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="Soportes"
        entityDescription="Registro completo de todas las acciones realizadas sobre los documentos y archivos del sistema"
        defaultTab="soportes"
        operations={[
          {
            label: 'Eliminados',
            auditType: 'soportes',
            title: 'Soportes Eliminados',
            description: 'Registro completo de todos los documentos y archivos eliminados del sistema',
            emptyMessage: 'No se encontraron soportes eliminados'
          }
        ]}
      />
    </div>
  );
}
