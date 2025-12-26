import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getCategorias } from "@/app/actions/catalogos";

export default async function CategoriasPage() {
    const result = await getCategorias();
    const categorias = result.success ? result.data : [];

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Categorías</h1>
            <p className="mb-6 ml-3">Clasificaciones dentro de cada materia legal</p>
            <CatalogDetailClient
                data={categorias}
                columns={["ID Materia", "Número", "Nombre de Categoría", "Materia"]}
                addLabel="Añadir Categoría"
                filterField="nombre_materia"
                autoGenerateFilter={true}
            />
        </>
    );
}
