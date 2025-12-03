'use client';

import type { Appointment } from '@/types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
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
    <div className="relative">
      {/* Primera línea: Título - Fecha (izquierda) y Hora (derecha) */}
      <div className="flex items-start justify-between mb-1">
        <p className="text-base text-black font-normal">
          {appointment.title} - {formatDate(appointment.date)}
        </p>
        <p className="text-base text-primary font-normal whitespace-nowrap">
          {formatTime(appointment.time)}
        </p>
      </div>

      {/* Segunda línea: Detalle del Caso */}
      <p className="text-base text-gray-600 font-normal">
        Caso: {appointment.caseDetail}
      </p>
    </div>
  );
}

