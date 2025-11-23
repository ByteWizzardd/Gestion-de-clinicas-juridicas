'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CalendarWidgetProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  appointments?: { date: Date }[];
}

export default function CalendarWidget({
  selectedDate,
  onDateChange,
  onMonthChange,
  appointments = [],
}: CalendarWidgetProps) {
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
    if (!isCurrentMonth) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return appointments.some((apt) => {
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
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeftIcon className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-xl font-semibold text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRightIcon className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Tabla de calendario con bordes */}
      <div className="border border-gray-300 rounded-2xl overflow-hidden flex-1 flex flex-col">
        {/* Header de días de la semana */}
        <div className="grid grid-cols-7 border-b border-gray-300 flex-shrink-0">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`text-center text-xs font-medium text-gray-600 py-2 border-r border-gray-300 bg-gray-50 ${
                index === dayNames.length - 1 ? 'border-r-0' : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid de días del calendario - 6 filas */}
        <div className="grid grid-cols-7 grid-rows-6 flex-1">
          {/* Días del mes anterior */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => {
            const day = daysInPrevMonth - startingDayOfWeek + index + 1;
            const isLastInRow = (index + 1) % 7 === 0;
            return (
              <button
                key={`prev-${day}`}
                onClick={() => handleDayClick(day, false)}
                className={` p-2 text-gray-400 bg-[#DDE2E8] border-r border-b border-gray-300 hover:bg-gray-300 transition-colors text-sm text-left ${
                  isLastInRow ? 'border-r-0' : ''
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
            const hasApts = hasAppointments(day, true);
            // Calcular posición en el grid completo (incluyendo días previos)
            const gridPosition = startingDayOfWeek + index;
            const isLastInRow = (gridPosition + 1) % 7 === 0;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day, true)}
                className={`
 p-2 border-r border-b border-gray-300 transition-colors text-sm text-left relative
                  ${isLastInRow ? 'border-r-0' : ''}
                  ${
                    isCurrentDay
                      ? 'bg-primary text-white font-semibold hover:bg-primary-dark'
                      : hasApts
                      ? 'bg-primary-light text-primary font-medium hover:bg-primary-light/80'
                      : 'text-foreground hover:bg-gray-50'
                  }
                `}
              >
                {day}
                {hasApts && !isCurrentDay && (
                  <span className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-primary rounded-full" />
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
                className={` p-2 text-gray-400 bg-[#DDE2E8] border-r border-b border-gray-300 hover:bg-gray-300 transition-colors text-sm text-left ${
                  isLastInRow ? 'border-r-0' : ''
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

