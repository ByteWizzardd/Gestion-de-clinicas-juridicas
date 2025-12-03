'use client';

import { useState, useMemo } from 'react';
import CalendarWidget from '@/components/ui/calendar/CalendarWidget';
import AppointmentList from '@/components/cards/AppointmentList';
import type { Appointment } from '@/types/appointment';

// Datos de ejemplo - En producción esto vendría de una API
const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Orientación Divorcio',
    date: new Date(2025, 10, 1), // Noviembre 1, 2025
    time: '10:00',
    caseDetail: 'C-001 (S. Rodríguez) - UCAB GY',
    client: 'S. Rodríguez',
    location: 'UCAB GY',
  },
  {
    id: '2',
    title: 'Orientación Divorcio',
    date: new Date(2025, 10, 1), // Noviembre 1, 2025
    time: '10:00',
    caseDetail: 'C-001 (S. Rodríguez) - UCAB GY',
    client: 'S. Rodríguez',
    location: 'UCAB GY',
  },
  {
    id: '3',
    title: 'Orientación Divorcio',
    date: new Date(2025, 10, 1), // Noviembre 1, 2025
    time: '10:00',
    caseDetail: 'C-001 (S. Rodríguez) - UCAB GY',
    client: 'S. Rodríguez',
    location: 'UCAB GY',
  },
  {
    id: '4',
    title: 'Orientación Divorcio',
    date: new Date(2025, 10, 1), // Noviembre 1, 2025
    time: '10:00',
    caseDetail: 'C-001 (S. Rodríguez) - UCAB GY',
    client: 'S. Rodríguez',
    location: 'UCAB GY',
  },
];

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  // Filtrar citas del mes seleccionado
  const monthAppointments = useMemo(() => {
    return mockAppointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getFullYear() === selectedMonth.getFullYear() &&
        aptDate.getMonth() === selectedMonth.getMonth()
      );
    });
  }, [selectedMonth]);

  // Preparar datos para el calendario (solo fechas)
  const calendarAppointments = useMemo(() => {
    return mockAppointments.map((apt) => ({
      date: new Date(apt.date),
    }));
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    // Actualizar el mes seleccionado cuando se cambia de mes en el calendario
    const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    setSelectedMonth(newMonth);
  };

  const handleMonthChange = (date: Date) => {
    // Cuando el calendario cambia de mes, actualizar el mes seleccionado
    const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    setSelectedMonth(newMonth);
  };

  const handleAddAppointment = () => {
    // TODO: Implementar lógica para añadir nueva cita
    console.log('Añadir nueva cita');
  };

  return (
    <div className="h-full">
      <div className="mb-6 mt-4">
        <h1 className="text-3xl font-medium text-foreground mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Programación y Consultas
        </h1>
        <p className="text-base text-gray-600" style={{ fontFamily: 'var(--font-urbanist)' }}>
          Vista de programación de las citas.
        </p>
      </div>

      {/* Layout de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
        {/* Columna izquierda: Calendario */}
        <div className="h-[calc(100vh-10rem)]">
          <CalendarWidget
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onMonthChange={handleMonthChange}
            appointments={calendarAppointments}
          />
        </div>

        {/* Columna derecha: Lista de citas */}
        <div className="pr-6 h-[calc(100vh-10rem)]">
          <AppointmentList
            appointments={monthAppointments}
            selectedMonth={selectedMonth}
            onAddAppointment={handleAddAppointment}
          />
        </div>
      </div>
    </div>
  );
}

