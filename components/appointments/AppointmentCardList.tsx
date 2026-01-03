'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, FileText, MapPin } from 'lucide-react';
import type { Appointment } from '@/types/appointment';
import ActionMenu from '@/components/ui/ActionMenu';
import { AppointmentDetailModal } from '../appointmentModal/AppointmentDetailModal';

interface AppointmentCardListProps {
  appointments: Appointment[];
  onAddAppointment?: () => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
}

export default function AppointmentCardList({
  appointments,
  onAddAppointment,
  onEdit,
  onDelete,
  onView,
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
        console.log('Eliminar cita:', appointment);
      }
    }
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Lista de cards */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay citas registradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative"
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
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(appointment.date)}
                  </p>
                </div>

                {/* Caso relacionado */}
                <div className="mb-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {appointment.caseDetail}
                    </p>
                  </div>
                </div>

                {/* Cliente */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600 truncate">
                      {appointment.client}
                    </p>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600 truncate">
                      {appointment.location}
                    </p>
                  </div>
                </div>

                {/* Usuarios que atendieron */}
                {appointment.attendingUsers && (
                  <div className="mb-3">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {appointment.isMultiplePeople ? 'Atendido por: ' : 'Atendido por: '}
                        {appointment.attendingUsers}
                      </p>
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
