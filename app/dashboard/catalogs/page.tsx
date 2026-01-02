import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";
import { authorizeRole } from '@/lib/utils/auth-utils';

export const dynamic = 'force-dynamic';

export default async function CatalogsPage() {
  // Solo permitir al Coordinador (coordinator)
  await authorizeRole(['coordinator']);

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Gestión de Catálogos</h1>
      <p className="mb-6 ml-3">Mantenimiento de las tablas maestras del sistema</p>
      <div className="mt-10">
        <CatalogsClient counts={counts} />
      </div>
    </>
  );
}
