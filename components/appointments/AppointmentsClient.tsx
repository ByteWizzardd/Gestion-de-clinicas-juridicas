'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCitasAction } from '@/app/actions/citas';
import CalendarWidget from '@/components/ui/calendar/CalendarWidget';
import AppointmentList from '@/components/cards/AppointmentList';
import type { Appointment } from '@/types/appointment';
import { AppointmentModal } from '../appointmentModal/AppointmentModal';
import ConfirmModal from '../ui/feedback/ConfirmModal';

interface AppointmentsClientProps {
  initialAppointments: Appointment[];
}

export default function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [filterByDate, setFilterByDate] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const [appointments, setAppointments] = useState<Appointment[]>(
    initialAppointments.map((apt) => ({ ...apt, date: new Date(apt.date) }))
  );
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Filtrar citas según el modo: por día específico o por mes completo
  const displayedAppointments = useMemo(() => {
    if (filterByDate) {
      // Filtrar solo las citas del día seleccionado
      return appointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === selectedDateOnly.getTime();
      });
    } else {
      // Filtrar citas del mes seleccionado
      return appointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate.getFullYear() === selectedMonth.getFullYear() &&
          aptDate.getMonth() === selectedMonth.getMonth()
        );
      });
    }
  }, [appointments, selectedMonth, selectedDate, filterByDate]);

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
    // Activar filtro por día cuando se selecciona un día específico
    setFilterByDate(true);
  };

  const handleShowAllMonth = () => {
    // Desactivar filtro por día para mostrar todas las citas del mes
    setFilterByDate(false);
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
      <motion.div 
        className="mb-4 md:mb-6 mt-4"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-medium text-foreground mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Citas
        </h1>
        <p className="text-base text-gray-600" style={{ fontFamily: 'var(--font-urbanist)' }}>
          Vista de programación de las citas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
        <motion.div 
          className="h-[calc(100vh-10rem)]"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
        >
          <CalendarWidget
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onMonthChange={handleMonthChange}
            appointments={calendarAppointments}
          />
        </motion.div>

        <motion.div 
          className="pr-6 h-[calc(100vh-10rem)]"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.15, ease: "easeOut" }}
        >
          <AppointmentList
            appointments={displayedAppointments}
            selectedMonth={selectedMonth}
            selectedDate={filterByDate ? selectedDate : null}
            onAddAppointment={handleAddAppointment}
            onShowAllMonth={filterByDate ? handleShowAllMonth : undefined}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <AppointmentModal
            onClose={handleModalClose}
            onSave={handleModalSave}
            initialDate={modalDate || selectedDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

