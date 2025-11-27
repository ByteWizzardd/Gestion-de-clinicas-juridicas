import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/table/Table";

export default function CasesPage() {
  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Listado de Casos</h1>
      <p className="mb-6 ml-3">Directorio principal de todos los casos</p>
      <CaseTools addLabel="Añadir Caso" />
      <div className="mt-10"></div>
      <Table
        data={[]}
        columns={["Código", "Solicitante", "Materia", "Estatus", "Responsable Principal"]}
      />
    </>
  );
}

