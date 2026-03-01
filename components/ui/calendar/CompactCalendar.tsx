'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment } from '@/types/appointment';

interface CompactCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  appointments?: Appointment[];
  loading?: boolean;
}

export default function CompactCalendar({
  selectedDate,
  onDateChange,
  onMonthChange,
  appointments = [],
  loading = false,
}: CompactCalendarProps) {
  // Preparar datos para el calendario (solo fechas)
  const calendarAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    return appointments.map((apt) => ({
      date: new Date(apt.date),
    }));
  }, [appointments]);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Obtener el primer día del mes y cuántos días tiene
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const daysInMonth = lastDayOfMonth.getDate();
  // Ajustar para que la semana empiece en lunes (0 = lunes, 6 = domingo)
  const startingDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

  // Días del mes anterior para completar la primera semana
  const prevMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    0
  );
  const daysInPrevMonth = prevMonth.getDate();

  // Días del mes siguiente para completar la última semana
  const totalCells = 42; // 6 semanas × 7 días
  const daysInNextMonth = totalCells - startingDayOfWeek - daysInMonth;

  // Verificar si un día tiene citas
  const hasAppointments = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || loading) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    date.setHours(0, 0, 0, 0);
    return calendarAppointments.some((apt) => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === date.getTime();
    });
  };

  // Verificar si es el día actual
  const isToday = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return date.getTime() === today.getTime();
  };

  // Verificar si es el día seleccionado
  const isSelected = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) {
      let clickedDate: Date;
      if (day > 15) {
        // Es del mes anterior
        clickedDate = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 1,
          day
        );
        const newMonth = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 1,
          1
        );
        setCurrentMonth(newMonth);
        if (onMonthChange) {
          onMonthChange(newMonth);
        }
      } else {
        // Es del mes siguiente
        clickedDate = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          day
        );
        const newMonth = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          1
        );
        setCurrentMonth(newMonth);
        if (onMonthChange) {
          onMonthChange(newMonth);
        }
      }
      onDateChange(clickedDate);
      return;
    }

    const clickedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDateChange(clickedDate);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header con navegación - más compacto */}
      <div className="flex items-center justify-between mb-2 md:mb-3 shrink-0">
        <button
          onClick={handlePrevMonth}
          className="p-0.5 md:p-1 hover:bg-[var(--sidebar-hover)] rounded-md transition-colors cursor-pointer"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-[var(--foreground)] opacity-70" />
        </button>
        <h2 className="text-xs md:text-sm font-semibold text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-0.5 md:p-1 hover:bg-[var(--sidebar-hover)] rounded-md transition-colors cursor-pointer"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-[var(--foreground)] opacity-70" />
        </button>
      </div>

      {/* Tabla de calendario con bordes - más compacta */}
      <div className="border border-[var(--ui-border)] rounded-lg md:rounded-xl overflow-hidden flex-1 flex flex-col transition-colors">
        {/* Header de días de la semana - más compacto */}
        <div className="grid grid-cols-7 border-b border-[var(--ui-border)] shrink-0 transition-colors">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`text-center text-[9px] md:text-[10px] font-medium text-[var(--card-text-muted)] py-0.5 md:py-1 border-r border-[var(--ui-border)] bg-[var(--ui-bg-muted)] transition-colors ${index === dayNames.length - 1 ? 'border-r-0' : ''
                }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid de días del calendario - más compacto */}
        <div
          key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
          className="grid grid-cols-7 grid-rows-6 flex-1"
        >
          {/* Días del mes anterior */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => {
            const day = daysInPrevMonth - startingDayOfWeek + index + 1;
            const isLastInRow = (index + 1) % 7 === 0;
            return (
              <button
                key={`prev-${day}`}
                onClick={() => handleDayClick(day, false)}
                className={`p-0.5 md:p-1 text-[var(--card-text-muted)] opacity-50 bg-[var(--ui-bg-inactive)] border-r border-b border-[var(--ui-border)] hover:bg-opacity-80 transition-all text-[10px] md:text-xs text-center cursor-pointer ${isLastInRow ? 'border-r-0' : ''
                  }`}
              >
                {day}
              </button>
            );
          })}

          {/* Días del mes actual */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const isCurrentDay = isToday(day, true);
            const isSelectedDay = isSelected(day, true);
            const hasApts = hasAppointments(day, true);
            // Calcular posición en el grid completo (incluyendo días previos)
            const gridPosition = startingDayOfWeek + index;
            const isLastInRow = (gridPosition + 1) % 7 === 0;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day, true)}
                className={`
                    p-0.5 md:p-1 border-r border-b border-[var(--ui-border)] transition-colors text-[10px] md:text-xs text-center relative cursor-pointer
                    ${isLastInRow ? 'border-r-0' : ''}
                    ${isSelectedDay
                    ? isCurrentDay
                      ? 'bg-primary text-white font-semibold hover:bg-primary-dark'
                      : 'bg-primary/20 text-primary font-bold border border-primary/20 hover:bg-primary/30'
                    : isCurrentDay
                      ? 'text-primary font-bold border border-primary shadow-sm'
                      : hasApts
                        ? 'bg-primary-light text-primary font-medium hover:bg-primary-light/80'
                        : 'text-[var(--foreground)] hover:bg-[var(--ui-bg-muted)]'
                  }
                  `}
              >
                {day}
                {hasApts && !isSelectedDay && (
                  <span className={`absolute bottom-0.5 left-0.5 w-0.5 h-0.5 md:w-1 md:h-1 rounded-full ${isCurrentDay ? 'bg-primary' : 'bg-primary'}`} />
                )}
              </button>
            );
          })}

          {/* Días del mes siguiente */}
          {Array.from({ length: daysInNextMonth }).map((_, index) => {
            const day = index + 1;
            // Calcular posición en el grid completo
            const gridPosition = startingDayOfWeek + daysInMonth + index;
            const isLastInRow = (gridPosition + 1) % 7 === 0;
            return (
              <button
                key={`next-${day}`}
                onClick={() => handleDayClick(day, false)}
                className={`p-0.5 md:p-1 text-[var(--card-text-muted)] opacity-50 bg-[var(--ui-bg-inactive)] border-r border-b border-[var(--ui-border)] hover:bg-opacity-80 transition-all text-[10px] md:text-xs text-center cursor-pointer ${isLastInRow ? 'border-r-0' : ''
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}