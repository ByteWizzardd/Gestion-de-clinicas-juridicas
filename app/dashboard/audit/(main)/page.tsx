import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditClient from '@/components/audit/AuditClient';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  // Solo permitir al Coordinador
  await authorizeRole(['coordinator']);

  return (
    <div className="w-full">
      <div className="mb-4 md:mb-6 mt-4">
        <h1 className="text-4xl m-3 font-semibold font-primary">Auditoría del Sistema</h1>
        <p className="mb-6 ml-3">Registro completo de todas las acciones realizadas en el sistema</p>
      </div>
      <div className="px-0">
        <AuditClient />
      </div>
    </div>
  );
}
