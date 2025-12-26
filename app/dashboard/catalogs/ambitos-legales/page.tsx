import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getAmbitosLegales } from "@/app/actions/catalogos";

export default async function AmbitosLegalesPage() {
    const result = await getAmbitosLegales();
    const ambitos = result.success ? result.data : [];

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Ámbitos Legales</h1>
            <p className="mb-6 ml-3">Ámbitos específicos de aplicación legal</p>
            <CatalogDetailClient
                data={ambitos}
                columns={["ID Mat.", "Núm. Cat.", "Núm. Subcat.", "Núm. Ámbito", "Nombre", "Subcategoría", "Categoría", "Materia"]}
                addLabel="Añadir Ámbito Legal"
                filterField="nombre_materia"
                autoGenerateFilter={true}
            />
        </>
    );
}
