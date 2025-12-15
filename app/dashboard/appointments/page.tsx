'use client';

import { useState, useMemo, useEffect } from 'react';
import CalendarWidget from '@/components/ui/calendar/CalendarWidget';
import AppointmentList from '@/components/cards/AppointmentList';
import type { Appointment } from '@/types/appointment';
import { getApiHeaders } from '@/lib/utils/api-client';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  // Cargar citas desde la API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/citas', {
          headers: getApiHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar las citas');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          // Convertir las fechas de string a Date
          const appointmentsWithDates = result.data.map((apt: any) => ({
            ...apt,
            date: new Date(apt.date),
          }));
          setAppointments(appointmentsWithDates);
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error al cargar citas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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

      {/* Estados de carga y error */}
      {loading && (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <p className="text-gray-600">Cargando citas...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error al cargar las citas</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Layout de dos columnas */}
      {!loading && !error && (
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
      )}
    </div>
  );
}

