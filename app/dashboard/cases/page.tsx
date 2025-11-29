import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/table/Table";

// Datos de prueba
const mockCases = [
  {
    codigo: "CASE-001",
    solicitante: "Juan Pérez",
    materia: "Derecho Civil",
    estatus: "En Proceso",
    responsable: "Dr. María González"
  },
  {
    codigo: "CASE-002",
    solicitante: "Ana Martínez",
    materia: "Derecho Laboral",
    estatus: "Cerrado",
    responsable: "Dr. Carlos Rodríguez"
  },
  {
    codigo: "CASE-003",
    solicitante: "Luis Hernández",
    materia: "Derecho Penal",
    estatus: "En Revisión",
    responsable: "Dra. Laura Sánchez"
  },
  {
    codigo: "CASE-004",
    solicitante: "Carmen López",
    materia: "Derecho Familiar",
    estatus: "En Proceso",
    responsable: "Dr. Roberto Díaz"
  },
  {
    codigo: "CASE-005",
    solicitante: "Pedro García",
    materia: "Derecho Comercial",
    estatus: "Pendiente",
    responsable: "Dra. Sofía Ramírez"
  },
  {
    codigo: "CASE-006",
    solicitante: "María Fernández",
    materia: "Derecho Civil",
    estatus: "En Proceso",
    responsable: "Dr. Miguel Torres"
  },
  {
    codigo: "CASE-007",
    solicitante: "José Morales",
    materia: "Derecho Laboral",
    estatus: "Cerrado",
    responsable: "Dra. Patricia Vega"
  },
  {
    codigo: "CASE-008",
    solicitante: "Rosa Jiménez",
    materia: "Derecho Penal",
    estatus: "En Revisión",
    responsable: "Dr. Fernando Castro"
  },
  {
    codigo: "CASE-009",
    solicitante: "Carlos Ruiz",
    materia: "Derecho Familiar",
    estatus: "En Proceso",
    responsable: "Dra. Gabriela Mendoza"
  },
  {
    codigo: "CASE-010",
    solicitante: "Laura Ortiz",
    materia: "Derecho Comercial",
    estatus: "Pendiente",
    responsable: "Dr. Alejandro Herrera"
  },
  {
    codigo: "CASE-011",
    solicitante: "Diego Vargas",
    materia: "Derecho Civil",
    estatus: "En Proceso",
    responsable: "Dra. Isabel Moreno"
  },
  {
    codigo: "CASE-012",
    solicitante: "Elena Cruz",
    materia: "Derecho Laboral",
    estatus: "Cerrado",
    responsable: "Dr. Andrés Vargas"
  }
];

export default function CasesPage() {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl m-3 font-semibold font-primary">Listado de Casos</h1>
      <p className="mb-6 ml-3 text-sm sm:text-base">Directorio principal de todos los casos</p>
      <CaseTools addLabel="Añadir Caso" />
      <div className="mt-10"></div>
      <Table
        data={mockCases}
        columns={["Código", "Solicitante", "Materia", "Estatus", "Responsable Principal"]}
      />
    </>
  );
}

