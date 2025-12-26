import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getMunicipios } from "@/app/actions/catalogos";

export default async function MunicipiosPage() {
  const result = await getMunicipios();
  const municipios = result.success ? result.data : [];

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Municipios</h1>
      <p className="mb-6 ml-3">Municipios asociados a cada estado</p>
      <CatalogDetailClient
        data={municipios}
        columns={["ID Estado", "Número", "Nombre", "Estado"]}
        addLabel="Añadir Municipio"
        filterField="nombre_estado"
        autoGenerateFilter={true}
      />
    </>
  );
}
