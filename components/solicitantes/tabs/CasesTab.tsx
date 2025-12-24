'use client';

import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';
import Table from '@/components/Table/Table';

interface CasesTabProps {
  casos: Array<{
    id_caso: number;
    fecha_solicitud: string | null;
    fecha_inicio_caso: string | null;
    fecha_fin_caso: string | null;
    tramite: string | null;
    estatus: string | null;
    cant_beneficiarios: number | null;
    observaciones: string | null;
    nombre_nucleo: string | null;
    nombre_materia: string | null;
    nombre_categoria: string | null;
    nombre_subcategoria: string | null;
  }>;
}

export default function CasesTab({ casos }: CasesTabProps) {
  const router = useRouter();

  if (!casos || casos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No hay casos asociados a este solicitante</p>
      </div>
    );
  }
  const tableData = casos.map((caso) => ({
    codigo: caso.id_caso, // Primera columna
    fecha_solicitud: caso.fecha_solicitud ? formatDate(caso.fecha_solicitud) : 'N/A', // Segunda columna
    tramite: caso.tramite || 'N/A', // Tercera columna
    estatus: caso.estatus || 'N/A', // Cuarta columna
    nucleo: caso.nombre_nucleo || 'N/A', // Quinta columna
    materia: caso.nombre_materia || 'N/A', // Sexta columna
  }));

  const handleView = (data: Record<string, unknown>) => {
    const codigo = data.codigo as string;
    if (codigo && codigo.startsWith('C-')) {
      const idCaso = codigo.substring(2);
      router.push(`/dashboard/cases/${idCaso}`);
    }
  };

  return (
    <div className="space-y-4">
      <Table
        data={tableData}
        columns={['Código', 'Fecha Solicitud', 'Trámite', 'Estatus', 'Núcleo', 'Materia']}
        onView={handleView}
        rowsPerPage={10}
      />
    </div>
  );
}