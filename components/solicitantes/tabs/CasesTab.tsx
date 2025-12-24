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
    id_caso: caso.id_caso,
    fecha_solicitud: caso.fecha_solicitud ? formatDate(caso.fecha_solicitud) : 'N/A',
    tramite: caso.tramite || 'N/A',
    estatus: caso.estatus || 'N/A',
    nucleo: caso.nombre_nucleo || 'N/A',
    materia: caso.nombre_materia || 'N/A'
  }));

  const handleView = (data: Record<string, unknown>) => {
    const idCaso = data.id_caso as number;
    if (idCaso) {
      router.push(`/dashboard/cases/${idCaso}`);
    }
  };

  const handleEdit = (data: Record<string, unknown>) => {
    const idCaso = data.id_caso as number;
    if (idCaso) {
      router.push(`/dashboard/cases/${idCaso}?edit=true`);
    }
  };

  const handleDelete = (data: Record<string, unknown>) => {
    const idCaso = data.id_caso as number;
    if (idCaso) {
      const confirmDelete = window.confirm(`¿Está seguro de que desea eliminar el caso ${idCaso}?`);
      if (confirmDelete) {
        alert(`Eliminar caso ${idCaso}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Table
        data={tableData}
        columns={['Código', 'Fecha Solicitud', 'Trámite', 'Estatus', 'Núcleo', 'Materia']}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowsPerPage={10}
      />
    </div>
  );
}