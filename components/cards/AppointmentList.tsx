'use client';

import { useState } from 'react';
import type { Appointment } from '@/types/appointment';
import AppointmentCard from './AppointmentCard';
import { AppointmentScheduleModal } from '../appointmentModal/AppointmentScheduleModal';
import NewAppointmentButton from '../appointments/NewAppointmentButton';
import { ArrowLeft } from 'lucide-react';

interface AppointmentListProps {
  appointments: Appointment[];
  selectedMonth: Date;
  selectedDate?: Date | null;
  onAddAppointment?: () => void;
  onScheduleAppointment?: () => void;
  onShowAllMonth?: () => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  addButton?: React.ReactNode; // Botón desacoplado para flexibilidad
}

export default function AppointmentList({
  appointments,
  selectedMonth,
  selectedDate,
  onAddAppointment,
  onScheduleAppointment,
  onShowAllMonth,
  onAppointmentClick,
  addButton,
}: AppointmentListProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const dayName = dayNames[date.getDay()];
    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  const formatDateShort = (date: Date): string => {
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  };

  const monthYear = `${monthNames[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;
  const isFilteredByDate = selectedDate !== null && selectedDate !== undefined;

  // Ordenar citas cronológicamente
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // Primero por fecha
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }

    // Si es la misma fecha, ordenar por hora
    const [hoursA, minutesA] = a.time.split(':').map(Number);
    const [hoursB, minutesB] = b.time.split(':').map(Number);
    const timeA = hoursA * 60 + minutesA;
    const timeB = hoursB * 60 + minutesB;

    return timeA - timeB;
  });

  // Renderizar el dropdown de añadir
  const renderAddButton = () => {
    if (addButton) {
      return addButton;
    }

    if (onAddAppointment) {
      const handleSchedule = () => {
        if (onScheduleAppointment) {
          onScheduleAppointment();
        } else {
          setShowScheduleModal(true);
        }
      };

      return (
        <NewAppointmentButton
          onRegister={onAddAppointment}
          onSchedule={handleSchedule}
          variant="icon"
          className="mb-1"
        />
      );
    }

    return null;
  };

  const handleScheduleModalClose = () => {
    setShowScheduleModal(false);
  };

  const handleScheduleModalSave = () => {
    setShowScheduleModal(false);
    // Aquí podrías recargar las citas si fuera necesario
  };

  return (
    <div className="relative h-full">
      <div className="bg-white rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] h-full flex flex-col">
        {/* Header con título y botón */}
        <div className="pt-6 px-6 pb-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            {isFilteredByDate && selectedDate ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  onClick={onShowAllMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors shrink-0 cursor-pointer"
                  aria-label="Ver todas las citas del mes"
                  title="Ver todas las citas del mes"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-medium text-foreground truncate" title={formatDate(selectedDate)}>
                    Citas - {formatDateShort(selectedDate)}
                  </h2>
                  <p className="text-sm text-gray-500 truncate">
                    {dayNames[selectedDate.getDay()]}, {selectedDate.getFullYear()}
                  </p>
                </div>
              </div>
            ) : (
              <h2 className="text-xl font-medium text-foreground flex-1 min-w-0 truncate">
                Citas - {monthYear}
              </h2>
            )}
            <div className="shrink-0">
              {renderAddButton()}
            </div>
          </div>
          {/* Línea divisoria naranja */}
          <div className="border-b-2 border-secondary w-full"></div>
        </div>

        {/* Lista de citas dentro del contenedor único */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {sortedAppointments.length === 0 ? (
            <div className="text-center text-gray-500 py-8 px-6">
              <p>
                {isFilteredByDate
                  ? 'No hay citas para este día'
                  : 'No hay citas para este mes'}
              </p>
            </div>
          ) : (
            <div className="px-6">
              {sortedAppointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className={`${index === 0 ? 'pt-6 pb-4' : 'pt-4 pb-4'
                    } ${index !== sortedAppointments.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                >
                  <AppointmentCard
                    appointment={appointment}
                    onClick={onAppointmentClick ? () => onAppointmentClick(appointment) : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal de programar cita */}
      {showScheduleModal && (
        <AppointmentScheduleModal
          onClose={handleScheduleModalClose}
          onSave={handleScheduleModalSave}
          initialDate={selectedDate || undefined}
        />
      )}
    </div>
  );
}

