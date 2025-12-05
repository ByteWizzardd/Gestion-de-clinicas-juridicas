'use client';

import DashboardAppointmentCard from './DashboardAppointmentCard';

interface Appointment {
  time: string;
  title: string;
  client: string;
  reason: string;
}

interface DashboardAppointmentListProps {
  appointments: Appointment[];
}

export default function DashboardAppointmentList({
  appointments,
}: DashboardAppointmentListProps) {
  return (
    <div className="flex flex-col gap-2.5 h-full">
      {appointments.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">
          No hay citas programadas
        </div>
      ) : (
        appointments.map((appointment, index) => (
          <DashboardAppointmentCard
            key={index}
            time={appointment.time}
            title={appointment.title}
            client={appointment.client}
            reason={appointment.reason}
          />
        ))
      )}
    </div>
  );
}

