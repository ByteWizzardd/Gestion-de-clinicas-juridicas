import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getParroquias } from "@/app/actions/catalogos";

export default async function ParroquiasPage() {
  const result = await getParroquias();
  const parroquias = result.success ? result.data : [];

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Parroquias</h1>
      <p className="mb-6 ml-3">Parroquias asociadas a cada municipio</p>
      <CatalogDetailClient
        data={parroquias}
        columns={["ID Estado", "Núm. Mun.", "Núm. Parr.", "Nombre", "Municipio", "Estado"]}
        addLabel="Anadir Parroquia"
        filterField="nombre_estado"
        autoGenerateFilter={true}
      />
    </>
  );
}
