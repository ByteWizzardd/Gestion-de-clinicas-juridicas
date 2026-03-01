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


  return (
    <div className="relative cursor-pointer hover:bg-[var(--sidebar-hover)] rounded-lg p-2 -m-2 transition-colors" onClick={onClick}>
      {/* Primera línea: Caso y Fecha */}
      <div className="mb-1">
        <p className="text-base text-[var(--foreground)] font-normal">
          {appointment.caseDetail.split('(')[0].trim()} ({appointment.client}) {formatDate(appointment.date)}
        </p>
      </div>

      {/* Segunda línea: Materia */}
      <p className="text-base text-[var(--card-text-muted)] font-normal transition-colors">
        {appointment.title}
      </p>
    </div>
  );
}

