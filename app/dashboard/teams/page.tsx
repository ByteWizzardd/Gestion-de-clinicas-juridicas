import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";
import { authorizeRole } from '@/lib/utils/auth-utils';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  // Solo permitir al Coordinador (coordinator)
  await authorizeRole(['coordinator']);

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Gestión de Equipo</h1>
      <p className="mb-6 ml-3">
        Supervisión de la carga de trabajo, desempeño y asignación de personal estudiantil
      </p>
      <CaseTools addLabel="Añadir Estudiante" />
      <div className="mt-10"></div>
      <Table
        data={[]}
        columns={["Cédula", "Nombre Completo", "Casos Asignados", "Casos Cerrados"]}
      />
    </>
  );
}

