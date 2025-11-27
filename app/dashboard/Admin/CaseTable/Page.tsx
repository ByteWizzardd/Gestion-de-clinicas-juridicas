import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";

{/* Página principal de Profesores para los casos */}


export default function DashboardPage() {
  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Listado de Casos</h1>
      <p className="mb-6 ml-3">Directorio principal de todos los casos</p>
      <CaseTools addLabel="Añadir Caso"/>
      <div className="mt-10"></div>
      <Table data={[]} columns={["Código","Solicitante","Materia","Estatus","Responsable Principal"]}/>
    </>
  );
}
