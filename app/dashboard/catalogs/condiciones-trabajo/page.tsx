import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getCondicionesTrabajo } from "@/app/actions/catalogos";

export default async function CondicionesTrabajoPage() {
  const result = await getCondicionesTrabajo();
  const condiciones = result.success ? result.data : [];

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Condiciones de Trabajo</h1>
      <p className="mb-6 ml-3">Tipos de condiciones laborales de los solicitantes</p>
      <CatalogDetailClient
        data={condiciones}
        columns={["ID", "Nombre de Condición"]}
        addLabel="Añadir Condición"
      />
    </>
  );
}
