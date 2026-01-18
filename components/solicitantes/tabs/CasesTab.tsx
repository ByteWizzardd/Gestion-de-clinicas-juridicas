'use client';

import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';
import Table from '@/components/Table/Table';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';
import { deleteCasoAction } from '@/app/actions/casos';
import { useToast } from '@/components/ui/feedback/ToastProvider';

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
  const { toast } = useToast();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
    materia: (() => {
      const materia = caso.nombre_materia || 'Sin materia';
      const categoria = caso.nombre_categoria?.trim() || '';
      const subcategoria = caso.nombre_subcategoria?.trim() || '';

      const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría' && categoria.toLowerCase() !== 'n/a';
      const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría' && subcategoria.toLowerCase() !== 'n/a';

      let text = materia;
      if (hasCategoria && hasSubcategoria) {
        text += ` - ${categoria} ${subcategoria}`;
      } else if (hasCategoria) {
        text += ` - ${categoria}`;
      } else if (hasSubcategoria) {
        text += ` - ${subcategoria}`;
      }
      return text;
    })()
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
      setItemToDelete(idCaso);
      setDeleteMotivo('');
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async (motivo?: string) => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteCasoAction(itemToDelete, motivo || 'Sin motivo especificado');
      if (result.success) {
        toast.success('Caso eliminado correctamente');
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        setDeleteMotivo('');
        router.refresh(); // O recargar datos si es necesario
      } else {
        toast.error(result.error?.message || 'Error desconocido', 'Error al eliminar');
      }
    } catch (e) {
      console.error(e);
      toast.error('Ocurrió un error al intentar eliminar el caso');
    } finally {
      setIsDeleting(false);
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
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
          setDeleteMotivo('');
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar caso"
        message={
          <div className="space-y-4">
            <p>
              ¿Estás seguro de que deseas eliminar el caso <strong>{itemToDelete}</strong>?
            </p>
            <p className="text-red-600 font-semibold">
              Esta acción es irreversible y eliminará todos los datos asociados (citas, documentos, etc.).
            </p>
          </div>
        }
        confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
        cancelLabel="Cancelar"
        confirmVariant="danger"
        showMotive={true}
        motiveValue={deleteMotivo}
        onMotiveChange={setDeleteMotivo}
        motivePlaceholder="Indique el motivo de la eliminación..."
        disabled={isDeleting}
      />
    </div>
  );
}