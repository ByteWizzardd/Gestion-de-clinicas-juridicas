import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getMaterias } from "@/app/actions/catalogos";

export default async function MateriasPage() {
    const result = await getMaterias();
    const materias = result.success ? result.data : [];

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Materias</h1>
            <p className="mb-6 ml-3">Áreas principales del derecho que se manejan en el sistema</p>
            <CatalogDetailClient
                data={materias}
                columns={["ID", "Nombre"]}
                addLabel="Añadir Materia"
            />
        </>
    );
}
