import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getEstados } from "@/app/actions/catalogos";

export default async function EstadosPage() {
    const result = await getEstados();
    const estados = result.success ? result.data : [];

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Estados</h1>
            <p className="mb-6 ml-3">Estados del país registrados en el sistema</p>
            <CatalogDetailClient
                data={estados}
                columns={["ID", "Nombre de Estado"]}
                addLabel="Añadir Estado"
            />
        </>
    );
}
