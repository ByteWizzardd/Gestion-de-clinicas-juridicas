import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import { getNucleos } from "@/app/actions/catalogos";

export default async function NucleosPage() {
    const result = await getNucleos();
    const nucleos = result.success ? result.data : [];

    // Transform data for table display
    const tableData = nucleos.map((nucleo: any) => ({
        id_nucleo: nucleo.id_nucleo,
        nombre_nucleo: nucleo.nombre_nucleo,
        ubicacion: `${nucleo.nombre_parroquia}, ${nucleo.nombre_municipio}, ${nucleo.nombre_estado}`,
        nombre_estado: nucleo.nombre_estado // Keep for filtering
    }));

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Núcleos</h1>
            <p className="mb-6 ml-3">Centros de atención donde se pueden originar los casos</p>
            <CatalogDetailClient
                data={tableData}
                columns={["Código", "Nombre de Núcleo", "Ubicación"]}
                addLabel="Añadir Núcleo"
                filterField="nombre_estado"
                autoGenerateFilter={true}
            />
        </>
    );
}
