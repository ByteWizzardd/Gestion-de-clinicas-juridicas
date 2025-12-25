'use client';

import { useState, useMemo } from 'react';
import { getCitasAction } from '@/app/actions/citas';
import CalendarWidget from '@/components/ui/calendar/CalendarWidget';
import AppointmentList from '@/components/cards/AppointmentList';
import type { Appointment } from '@/types/appointment';
import { AppointmentModal } from '../appointmentModal/AppointmentModal';

interface AppointmentsClientProps {
  initialAppointments: Appointment[];
}

export default function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(
    initialAppointments.map((apt) => ({ ...apt, date: new Date(apt.date) }))
  );
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);

  // Filtrar citas del mes seleccionado
  const monthAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getFullYear() === selectedMonth.getFullYear() &&
        aptDate.getMonth() === selectedMonth.getMonth()
      );
    });
  }, [appointments, selectedMonth]);

  // Preparar datos para el calendario (solo fechas)
  const calendarAppointments = useMemo(() => {
    return appointments.map((apt) => ({
      date: new Date(apt.date),
    }));
  }, [appointments]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    setSelectedMonth(newMonth);
  };

  const handleMonthChange = (date: Date) => {
    const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    setSelectedMonth(newMonth);
  };
  // Abrir modal para agregar nueva cita
  const handleAddAppointment = () => {
    setModalDate(selectedDate);
    setShowModal(true);
  };
  // Cerrar modal
  const handleModalClose = () => {
    setShowModal(false);
    setModalDate(null);
  };

  const handleModalSave = async () => {
    // Recargar citas desde el backend
    const result = await getCitasAction();
    if (result.success && result.data) {
      if (Array.isArray(result.data)) {
        setAppointments(result.data.map((apt: Appointment) => ({ ...apt, date: new Date(apt.date) })));
      } else {
        setAppointments([]);
      }
    }
    setShowModal(false);
    setModalDate(null);
  };

  return (
    <div className="h-full relative">
      <div className="mb-6 mt-4">
        <h1 className="text-3xl font-medium text-foreground mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Programación y Consultas
        </h1>
        <p className="text-base text-gray-600" style={{ fontFamily: 'var(--font-urbanist)' }}>
          Vista de programación de las citas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
        <div className="h-[calc(100vh-10rem)]">
          <CalendarWidget
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onMonthChange={handleMonthChange}
            appointments={calendarAppointments}
          />
        </div>

        <div className="pr-6 h-[calc(100vh-10rem)]">
          <AppointmentList
            appointments={monthAppointments}
            selectedMonth={selectedMonth}
            onAddAppointment={handleAddAppointment}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <AppointmentModal
            onClose={handleModalClose}
            onSave={handleModalSave}
            initialDate={modalDate || selectedDate}
          />
        </div>
      )}
    </div>
  );
}

