import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";

export default function CatalogsPage() {
  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Centros Activos</h1>
      <p className="mb-6 ml-3">Total de centros de atención donde se pueden originar casos</p>
      <CaseTools addLabel="Añadir Núcleo" />
      <div className="mt-10"></div>
      <Table data={[]} columns={["Código", "Nombre de Núcleo"]} />
    </>
  );
}

