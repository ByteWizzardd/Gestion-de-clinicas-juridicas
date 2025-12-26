import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getTiposCaracteristicas } from "@/app/actions/catalogos";

export default async function TiposCaracteristicasPage() {
  const result = await getTiposCaracteristicas();
  const tipos = result.success ? result.data : [];

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Tipos de Características</h1>
      <p className="mb-6 ml-3">Categorías de características de vivienda</p>
      <CatalogDetailClient
        data={tipos}
        columns={["ID", "Nombre del Tipo"]}
        addLabel="Añadir Tipo"
      />
    </>
  );
}
