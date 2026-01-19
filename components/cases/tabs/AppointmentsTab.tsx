'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, FileText, Trash2, Pencil } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';
import { deleteCitaAction } from '@/app/actions/citas';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';
import { useToast } from '@/components/ui/feedback/ToastProvider';

interface AppointmentsTabProps {
  citas?: Array<{
    num_cita: number;
    id_caso: number;
    fecha_encuentro: string;
    fecha_proxima_cita: string | null;
    orientacion: string;
    atenciones: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_registro: string;
    }>;
  }>;
  onRefresh?: () => void;
  onEditAppointment?: (cita: {
    num_cita: number;
    id_caso: number;
    fecha_encuentro: string;
    fecha_proxima_cita: string | null;
    orientacion: string;
    atenciones: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_registro: string;
    }>;
  }) => void;
}

export default function AppointmentsTab({ citas, onRefresh, onEditAppointment }: AppointmentsTabProps) {
  const [citaToDelete, setCitaToDelete] = useState<{ num_cita: number; id_caso: number; fecha_encuentro: string } | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteMotive, setDeleteMotive] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleEditAppointment = (cita: {
    num_cita: number;
    id_caso: number;
    fecha_encuentro: string;
    fecha_proxima_cita: string | null;
    orientacion: string;
    atenciones: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_registro: string;
    }>;
  }) => {
    console.log('DEBUG AppointmentsTab - handleEditAppointment called with:', cita);
    onEditAppointment?.(cita);
  };

  const handleDeleteAppointment = (cita: {
    num_cita: number;
    id_caso: number;
    fecha_encuentro: string;
  }) => {
    setCitaToDelete({
      num_cita: cita.num_cita,
      id_caso: cita.id_caso,
      fecha_encuentro: cita.fecha_encuentro
    });
    setDeleteMotive(''); // Limpiar motivo anterior
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!citaToDelete) return;

    if (!deleteMotive.trim()) {
      toast.error('Debe indicar un motivo para cancelar la cita');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCitaAction({
        appointmentId: `cita-${citaToDelete.num_cita}-${citaToDelete.id_caso}-${new Date(citaToDelete.fecha_encuentro).getTime()}`,
        motivo: deleteMotive
      });

      if (result.success) {
        // Cerrar modal y limpiar estado
        setShowDeleteConfirmModal(false);
        setCitaToDelete(null);
        setDeleteMotive('');

        if (onRefresh) {
          onRefresh();
        } else {
          // Fallback: recargar la página
          window.location.reload();
        }

        toast.success("Cita eliminada correctamente");
      } else {
        console.error('Error deleting appointment:', result.error);
        toast.error(result.error?.message || 'Error al eliminar la cita');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Error inesperado al eliminar la cita');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setCitaToDelete(null);
    setDeleteMotive('');
  };

  // Ordenar citas por número de cita (descendente - mayor número primero)
  const citasOrdenadas = citas ? [...citas].sort((a, b) => {
    return b.num_cita - a.num_cita; // Mayor número primero
  }).map(cita => ({
    ...cita,
    // Ordenar atenciones por fecha de registro (descendente)
    atenciones: cita.atenciones ? [...cita.atenciones].sort((a, b) => {
      const fechaA = new Date(a.fecha_registro);
      const fechaB = new Date(b.fecha_registro);
      return fechaB.getTime() - fechaA.getTime();
    }) : []
  })) : [];

  if (!citasOrdenadas || citasOrdenadas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No hay citas registradas para este caso</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {citasOrdenadas.map((cita) => (
        <div key={`${cita.num_cita}-${cita.id_caso}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Cita #{cita.num_cita}</h4>
              <p className="text-sm text-gray-500 mt-1">
                Fecha de encuentro: {formatDate(cita.fecha_encuentro)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditAppointment(cita)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                title="Editar cita"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteAppointment(cita)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                title="Eliminar cita"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {cita.fecha_proxima_cita && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Próxima Cita
                </label>
                <p className="text-base text-gray-900 mt-1">{formatDate(cita.fecha_proxima_cita)}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500 mb-2">
                Orientación
              </label>
              <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-200">
                {cita.orientacion}
              </p>
            </div>

            {cita.atenciones && cita.atenciones.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2">
                  Atendido por ({cita.atenciones.length})
                </label>
                <div className="space-y-2">
                  {cita.atenciones.map((atencion, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-900 font-medium">{atencion.nombre_completo}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Fecha de registro: {formatDate(atencion.fecha_registro)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Modal de confirmación para eliminar cita */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar cita"
        message={
          citaToDelete ? (
            <div>
              <p className="mb-2">
                ¿Está seguro de que desea eliminar la cita{' '}
                <strong>#{citaToDelete.num_cita}</strong>?
              </p>
              <p className="mb-2">
                <strong>Fecha de encuentro:</strong> {formatDate(citaToDelete.fecha_encuentro)}
              </p>
              <p className="text-sm text-gray-600">
                Esta acción no se puede deshacer y también eliminará la acción correspondiente si existe.
              </p>
            </div>
          ) : (
            '¿Está seguro de que desea eliminar esta cita?'
          )
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        disabled={isDeleting}
        showMotive={true}
        motiveValue={deleteMotive}
        onMotiveChange={setDeleteMotive}
        motivePlaceholder="Indique el motivo de la eliminación..."
      />
    </div>
  );
}

