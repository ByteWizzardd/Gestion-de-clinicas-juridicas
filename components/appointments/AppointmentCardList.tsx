'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, FileText, CheckCircle, XCircle, Users } from 'lucide-react';
import type { Appointment } from '@/types/appointment';
import ActionMenu from '@/components/ui/ActionMenu';
import Button from '@/components/ui/Button';
import { AppointmentDetailModal } from '../appointmentModal/AppointmentDetailModal';

interface AppointmentCardListProps {
  appointments: Appointment[];
  onAddAppointment?: () => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
  onAppointmentCompleted?: (appointment: Appointment) => void;
  onAppointmentCancelled?: (appointment: Appointment) => void;
}

export default function AppointmentCardList({
  appointments,
  onAddAppointment,
  onEdit,
  onDelete,
  onView,
  onAppointmentCompleted,
  onAppointmentCancelled,
}: AppointmentCardListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const handleView = (appointment: Appointment) => {
    if (onView) {
      onView(appointment);
    } else {
      setSelectedAppointment(appointment);
      setShowDetailModal(true);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    if (onEdit) {
      onEdit(appointment);
    }
  };

  const handleDelete = (appointment: Appointment) => {
    if (onDelete) {
      onDelete(appointment);
    } else {
      const confirmDelete = window.confirm(
        `¿Está seguro de que desea eliminar la cita del ${formatDate(appointment.date)}?`
      );
      if (confirmDelete) {
        // Aquí se llamaría a la acción de eliminar
      }
    }
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentCompleted = (appointment: Appointment) => {
    if (onAppointmentCompleted) {
      onAppointmentCompleted(appointment);
    }
  };

  const handleAppointmentCancelled = (appointment: Appointment) => {
    if (onAppointmentCancelled) {
      onAppointmentCancelled(appointment);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Lista de cards */}
      {appointments.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-8 text-center transition-colors">
          <Calendar className="w-12 h-12 text-[var(--card-text-muted)] opacity-50 mx-auto mb-4" />
          <p className="text-[var(--card-text-muted)] text-lg">No hay citas registradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-5 hover:shadow-md transition-all relative"
            >
              {/* Menú de acciones */}
              <div className="absolute top-4 right-4">
                <ActionMenu
                  onView={() => handleView(appointment)}
                  onEdit={onEdit ? () => handleEdit(appointment) : undefined}
                  onDelete={onDelete ? () => handleDelete(appointment) : undefined}
                />
              </div>

              {/* Contenido de la card */}
              <div className="pr-8">
                {/* Fecha */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <p className="text-lg font-semibold text-[var(--foreground)] transition-colors">
                    {formatDate(appointment.date)}
                  </p>
                </div>

                {/* Caso relacionado */}
                <div className="mb-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-[var(--card-text-muted)] opacity-70 mt-1 shrink-0 transition-colors" />
                    <p className="text-sm text-[var(--card-text-muted)] line-clamp-2 transition-colors">
                      {appointment.caseDetail}
                    </p>
                  </div>
                </div>

                {/* Cliente */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--card-text-muted)] opacity-70 shrink-0 transition-colors" />
                    <p className="text-sm text-[var(--card-text-muted)] truncate transition-colors">
                      {appointment.client}
                    </p>
                  </div>
                </div>

                {/* Usuarios que atendieron */}
                {appointment.attendingUsers && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--card-text-muted)] opacity-70 shrink-0 transition-colors" />
                      <p className="text-xs text-[var(--card-text-muted)] opacity-80 line-clamp-2 transition-colors">
                        {appointment.isMultiplePeople ? 'Atendido por: ' : 'Atendido por: '}
                        {appointment.attendingUsers}
                      </p>
                    </div>
                  </div>
                )}

                {/* Botones para citas programadas */}
                {appointment.orientation === "Cita programada" && (
                  <div className="mt-4 pt-3 border-t border-[var(--card-border)] transition-colors">
                    <p className="text-xs text-[var(--card-text-muted)] mb-3 transition-colors">¿Se realizó la cita?</p>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAppointmentCompleted(appointment)}
                        className="flex-1 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Sí
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAppointmentCancelled(appointment)}
                        className="flex-1 flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        No
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={showDetailModal}
        onClose={handleDetailModalClose}
      />
    </div>
  );
}
