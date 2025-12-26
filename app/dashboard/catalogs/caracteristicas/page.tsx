import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getCaracteristicas } from "@/app/actions/catalogos";

export default async function CaracteristicasPage() {
  const result = await getCaracteristicas();
  const caracteristicas = result.success ? result.data : [];

  const filterOptions = [
    { value: 'true', label: 'Habilitado' },
    { value: 'false', label: 'Deshabilitado' }
  ];

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Características</h1>
      <p className="mb-6 ml-3">Características específicas de viviendas</p>
      <CatalogDetailClient
        data={caracteristicas}
        columns={["ID Tipo", "Número", "Descripción", "Tipo", "Habilitado"]}
        addLabel="Añadir Característica"
        filterField="habilitado"
        filterOptions={filterOptions}
        filterLabel="Estado"
      />
    </>
  );
}
