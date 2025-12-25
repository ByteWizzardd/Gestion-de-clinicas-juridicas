'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import CalendarWidget from '@/components/ui/calendar/CalendarWidget';
import AppointmentList from '@/components/cards/AppointmentList';
import type { Appointment } from '@/types/appointment';

interface AppointmentsClientProps {
  initialAppointments: Appointment[];
}

export default function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Convertir fechas de string a Date
  const appointments = useMemo(() => {
    return initialAppointments.map((apt: any) => ({
      ...apt,
      date: new Date(apt.date),
    }));
  }, [initialAppointments]);

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

  const handleAddAppointment = () => {
    // TODO: Implementar lógica para añadir nueva cita
  };

  return (
    <div className="h-full">
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
            appointments={monthAppointments}
            selectedMonth={selectedMonth}
            onAddAppointment={handleAddAppointment}
          />
        </motion.div>
      </div>
    </div>
  );
}

