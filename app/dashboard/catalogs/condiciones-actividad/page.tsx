import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getCondicionesActividad } from "@/app/actions/catalogos";

export default async function CondicionesActividadPage() {
  const result = await getCondicionesActividad();
  const condiciones = result.success ? result.data : [];

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Condiciones de Actividad</h1>
      <p className="mb-6 ml-3">Tipos de actividades de los solicitantes</p>
      <CatalogDetailClient
        data={condiciones}
        columns={["ID", "Nombre de Actividad"]}
        addLabel="Añadir Condición"
      />
    </>
  );
}
