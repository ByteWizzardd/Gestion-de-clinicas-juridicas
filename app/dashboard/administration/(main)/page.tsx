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
      <CatalogsClient counts={counts} />
    </>
  );
}
