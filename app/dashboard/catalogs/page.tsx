import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";
import { authorizeRole } from '@/lib/utils/auth-utils';

export const dynamic = 'force-dynamic';

export default async function CatalogsPage() {
  // Solo permitir al Coordinador (coordinator)
  await authorizeRole(['coordinator']);

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Centros Activos</h1>
      <p className="mb-6 ml-3">Total de centros de atención donde se pueden originar casos</p>
      <CaseTools addLabel="Añadir Núcleo" />
      <div className="mt-10"></div>
      <Table data={[]} columns={["Código", "Nombre de Núcleo"]} />
    </>
  );
}

