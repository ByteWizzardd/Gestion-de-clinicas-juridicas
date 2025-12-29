'use client';

import { useMemo } from 'react';
import DashboardAppointmentCard from './DashboardAppointmentCard';
import type { Appointment } from '@/types/appointment';

interface DashboardAppointment {
  time: string;
  title: string;
  client: string;
  reason: string;
}

interface DashboardAppointmentListProps {
  appointments: Appointment[];
  selectedDate: Date;
  loading?: boolean;
  error?: string | null;
}

export default function DashboardAppointmentList({
  appointments,
  selectedDate,
  loading = false,
  error = null,
}: DashboardAppointmentListProps) {
  // Convertir hora de HH:mm a formato AM/PM
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Filtrar citas del día seleccionado y transformar al formato del dashboard
  const dayAppointments = useMemo(() => {
    const selectedDateStr = selectedDate.toDateString();

    return appointments
      .filter((apt) => {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === selectedDateStr;
      })
      .sort((a, b) => {
        // Ordenar por hora
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];
        return minutesA - minutesB;
      })
      .map((apt): DashboardAppointment => ({
        time: formatTime(apt.time),
        title: `${apt.caseDetail.split('(')[0].trim()} (${apt.client.split(' ').slice(0, 2).join(' ')}.)`,
        client: '', // Consolidado en el título para evitar duplicidad
        reason: `Materia: ${apt.title}`
      }));
  }, [appointments, selectedDate]);

  // Estados de carga y error
  if (loading) {
    return (
      <div className="flex flex-col gap-2 md:gap-2.5 h-full">
        <div className="text-xs md:text-sm text-gray-500 text-center py-4">
          Cargando citas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 md:gap-2.5 h-full">
        <div className="text-xs md:text-sm text-red-500 text-center py-4">
          Error al cargar citas
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:gap-2.5 h-full">
      {dayAppointments.length === 0 ? (
        <div className="text-xs md:text-sm text-gray-500 text-center py-4">
          No hay citas programadas para este día
        </div>
      ) : (
        dayAppointments.map((appointment, index) => (
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