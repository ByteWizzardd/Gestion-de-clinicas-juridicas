import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getSubcategorias } from "@/app/actions/catalogos";

export default async function SubcategoriasPage() {
    const result = await getSubcategorias();
    const subcategorias = result.success ? result.data : [];

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Subcategorías</h1>
            <p className="mb-6 ml-3">Subdivisiones específicas de las categorías</p>
            <CatalogDetailClient
                data={subcategorias}
                columns={["ID Materia", "Núm. Cat.", "Núm. Subcat.", "Nombre", "Categoría", "Materia"]}
                addLabel="Añadir Subcategoría"
                filterField="nombre_materia"
                autoGenerateFilter={true}
            />
        </>
    );
}
