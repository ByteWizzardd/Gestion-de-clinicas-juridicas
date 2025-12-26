import CatalogsClient from "@/components/catalogs/CatalogsClient";
import { getCatalogCounts } from "@/app/actions/catalogos";

export default async function CatalogsPage() {
  const result = await getCatalogCounts();

  const counts = result.success ? result.data : {
    materias: 0,
    categorias: 0,
    subcategorias: 0,
    ambitos_legales: 0,
    tipos_caracteristicas: 0,
    caracteristicas: 0,
    estados: 0,
    municipios: 0,
    parroquias: 0,
    semestres: 0,
    nucleos: 0,
    condiciones_trabajo: 0,
    condiciones_actividad: 0
  };

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
