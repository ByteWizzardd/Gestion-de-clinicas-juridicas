import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getSemestres } from "@/app/actions/catalogos";

export default async function SemestresPage() {
  const result = await getSemestres();
  const semestres = result.success ? result.data : [];

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Semestres</h1>
      <p className="mb-6 ml-3">Períodos académicos registrados</p>
      <CatalogDetailClient
        data={semestres}
        columns={["TERM", "Fecha Inicio", "Fecha Fin"]}
        addLabel="Añadir Semestre"
      />
    </>
  );
}
