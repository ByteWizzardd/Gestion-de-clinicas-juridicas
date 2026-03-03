'use client';

import { useState } from 'react';
import { History, User, Calendar, Users, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date-formatter';
import { deleteAccionAction } from '@/app/actions/casos';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';
import AddActionModal from '@/components/cases/modals/AddActionModal';

interface ActionsHistoryTabProps {
  acciones?: Array<{
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    id_usuario_registra: string;
    fecha_registro: string;
    fecha_ejecucion?: string;
    nombres_usuario_registra: string;
    apellidos_usuario_registra: string;
    nombre_completo_usuario_registra: string;
    ejecutores: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_ejecucion: string;
    }>;
  }>;
  onRefresh?: () => void;
}

export default function ActionsHistoryTab({ acciones, onRefresh }: ActionsHistoryTabProps) {
  const [accionToDelete, setAccionToDelete] = useState<{ num_accion: number; id_caso: number; detalle_accion: string } | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteMotive, setDeleteMotive] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [accionToEdit, setAccionToEdit] = useState<{
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    ejecutores?: Array<{
      id_usuario_ejecuta: string;
      nombre_completo: string;
      fecha_ejecucion: string;
    }>;
  } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditAccion = (accion: {
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    ejecutores?: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_ejecucion: string;
    }>;
  }) => {
    // Mapear ejecutores de la estructura de BD a la estructura que espera el modal
    const ejecutoresMapeados = accion.ejecutores?.map(ejecutor => ({
      id_usuario_ejecuta: ejecutor.id_usuario,
      nombre_completo: ejecutor.nombre_completo,
      fecha_ejecucion: ejecutor.fecha_ejecucion
    }));

    setAccionToEdit({
      num_accion: accion.num_accion,
      id_caso: accion.id_caso,
      detalle_accion: accion.detalle_accion,
      comentario: accion.comentario,
      ejecutores: ejecutoresMapeados
    });
    setShowEditModal(true);
  };

  const handleDeleteAccion = (accion: {
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
  }) => {
    setAccionToDelete({
      num_accion: accion.num_accion,
      id_caso: accion.id_caso,
      detalle_accion: accion.detalle_accion
    });
    setDeleteMotive(''); // Limpiar motivo anterior
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!accionToDelete) return;

    setIsDeleting(true);

    try {
      const result = await deleteAccionAction({
        numAccion: accionToDelete.num_accion,
        idCaso: accionToDelete.id_caso,
        motivo: deleteMotive.trim() || undefined
      });

      if (result.success) {
        // Cerrar modal y limpiar estado
        setShowDeleteConfirmModal(false);
        setAccionToDelete(null);

        // Recargar los datos del caso
        if (onRefresh) {
          onRefresh();
        } else {
          // Fallback: recargar la página
          window.location.reload();
        }
      } else {
        alert(result.error?.message || 'Error al eliminar la acción');
      }
    } catch (error) {
      alert('Error inesperado al eliminar la acción');
      console.error('Error al eliminar acción:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setAccionToEdit(null);
  };

  const handleActionUpdated = () => {
    onRefresh?.();
    handleCloseEditModal();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setAccionToDelete(null);
    setDeleteMotive('');
  };

  if (!acciones || acciones.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-8 text-center transition-colors">
        <History className="w-12 h-12 text-[var(--card-text-muted)] opacity-20 mx-auto mb-4" />
        <p className="text-[var(--card-text-muted)] text-lg mb-2">No hay acciones registradas</p>
        <p className="text-sm text-[var(--card-text-muted)] opacity-60">Registre una nueva acción para comenzar el historial</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {acciones.map((accion) => (
        <div key={`${accion.num_accion}-${accion.id_caso}`} className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-4 sm:p-6 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-[var(--card-text)]">Acción #{accion.num_accion}</h4>
              {(accion.fecha_ejecucion || (accion.ejecutores && accion.ejecutores.length > 0)) && (
                <p className="text-sm text-[var(--card-text-muted)] mt-1">
                  Fecha de ejecución: {accion.fecha_ejecucion ? formatDate(accion.fecha_ejecucion) : formatDate(accion.ejecutores[0].fecha_ejecucion)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditAccion(accion)}
                className="text-[var(--card-text-muted)] hover:text-gray-700 p-1 rounded transition-colors cursor-pointer"
                title="Editar acción"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteAccion(accion)}
                className="text-[var(--card-text-muted)] hover:text-gray-700 p-1 rounded transition-colors cursor-pointer"
                title="Eliminar acción"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--card-text-muted)]">Detalle de la Acción</label>
              <p className="text-base text-[var(--card-text)] mt-1 whitespace-pre-wrap wrap-break-word overflow-wrap-anywhere hyphens-auto" style={{ wordBreak: 'break-word', hyphens: 'auto' }}>{accion.detalle_accion}</p>
            </div>

            {accion.comentario && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)]">Comentario</label>
                <p className="text-base text-[var(--card-text)] mt-1 whitespace-pre-wrap wrap-break-word overflow-wrap-anywhere hyphens-auto" style={{ wordBreak: 'break-word', hyphens: 'auto' }}>{accion.comentario}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-[var(--card-text-muted)]">Registrado por</label>
              <p className="text-base text-[var(--card-text)] mt-1">
                <Link
                  href={`/dashboard/users/${accion.id_usuario_registra}`}
                  className="text-primary hover:underline font-medium"
                >
                  {accion.nombre_completo_usuario_registra}
                </Link>
              </p>
              <p className="text-sm text-[var(--card-text-muted)] mt-1">
                Fecha de registro: {formatDate(accion.fecha_registro)}
              </p>
            </div>

            {accion.ejecutores && accion.ejecutores.length > 0 && (
              <div>
                <label className="text-sm font-medium text-[var(--card-text-muted)] mb-2">
                  Ejecutores ({accion.ejecutores.length})
                </label>
                <div className="space-y-2">
                  {accion.ejecutores.map((ejecutor, index) => (
                    <div key={index} className="bg-[var(--ui-bg-muted)] rounded-lg p-3 border border-[var(--card-border)]">
                      <Link
                        href={`/dashboard/users/${ejecutor.id_usuario}`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        {ejecutor.nombre_completo}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Modal de confirmación para eliminar acción */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar acción"
        message={
          accionToDelete ? (
            <div>
              <p className="mb-2">
                ¿Está seguro de que desea eliminar la acción{' '}
                <strong>#{accionToDelete.num_accion}</strong>?
              </p>
              <p className="mb-2">
                <strong>Detalle:</strong> {accionToDelete.detalle_accion}
              </p>
              <p className="text-sm text-gray-600">
                Esta acción no se puede deshacer.
              </p>
            </div>
          ) : (
            '¿Está seguro de que desea eliminar esta acción?'
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

      {/* Modal para editar acción */}
      {showEditModal && accionToEdit && (
        <AddActionModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onActionAdded={handleActionUpdated}
          idCaso={accionToEdit.id_caso}
          editingAction={accionToEdit}
        />
      )}
    </div>
  );
}

