import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Solicitantes</h1>
      <p className="mb-6 ml-3">Listado y búsqueda de todas las personas atendidas</p>
      <CaseTools addLabel="Añadir Solicitante"/>
      <div className="mt-10"></div>
      <Table data={[]} columns={["Cédula","Nombre Completo","Teléfono Celular","Núcleo","Fecha de Solicitud"]}/>
    </>
  );
}
