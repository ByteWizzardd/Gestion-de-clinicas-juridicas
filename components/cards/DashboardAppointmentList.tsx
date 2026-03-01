'use client';

import { useMemo } from 'react';
import DashboardAppointmentCard from './DashboardAppointmentCard';
import type { Appointment } from '@/types/appointment';
import AppointmentListSkeleton from '@/components/ui/skeletons/AppointmentListSkeleton';

interface DashboardAppointment {
  appointment: Appointment;
  date: string;
  reason: string;
}

interface DashboardAppointmentListProps {
  appointments: Appointment[];
  selectedDate: Date;
  loading?: boolean;
  error?: string | null;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export default function DashboardAppointmentList({
  appointments,
  selectedDate,
  loading = false,
  error = null,
  onAppointmentClick,
}: DashboardAppointmentListProps) {
  // Formatear fecha en formato DD/MM/YYYY
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filtrar citas del día seleccionado y mantener referencia al appointment original
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
        appointment: apt, // Mantener referencia al appointment original
        date: formatDate(apt.date),
        reason: apt.caseDetail // Solo mostrar el detalle del caso
      }));
  }, [appointments, selectedDate]);

  // Estados de carga y error
  if (loading) {
    return <AppointmentListSkeleton count={3} />;
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
        <div className="text-xs md:text-sm text-[var(--card-text-muted)] text-center py-4 transition-colors">
          No hay citas programadas para este día
        </div>
      ) : (
        dayAppointments.map((item, index) => (
          <DashboardAppointmentCard
            key={index}
            date={item.date}
            reason={item.reason}
            onClick={onAppointmentClick ? () => onAppointmentClick(item.appointment) : undefined}
          />
        ))
      )}
    </div>
  );
}