import CatalogsClient from '@/components/catalogs/CatalogsClient';
import { authorizeRole } from '@/lib/utils/auth-utils';
import { getAllCatalogCounts } from '@/lib/db/queries/catalogos.queries';

export const dynamic = 'force-dynamic';

export default async function CatalogsPage() {
  // Solo permitir al Coordinador (coordinator)
  await authorizeRole(['coordinator']);

  // Obtener los conteos de todos los catálogos
  const counts = await getAllCatalogCounts();

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
