'use client';

import type { Appointment } from '@/types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
}

export default function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="relative cursor-pointer hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors" onClick={onClick}>
      {/* Fecha de la cita */}
      <div className="mb-1">
        <p className="text-base text-primary font-normal">
          {formatDate(appointment.date)}
        </p>
      </div>

      {/* Caso relacionado */}
      <p className="text-base text-gray-600 font-normal">
        {appointment.caseDetail}
      </p>
    </div>
  );
}

