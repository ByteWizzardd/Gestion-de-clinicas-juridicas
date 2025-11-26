'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'motion/react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export default function DatePicker({ value, onChange, error, required }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    if (!value || !isCurrentMonth) return false;
    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return date.getTime() === selectedDate.getTime();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    ));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    ));
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    let clickedDate: Date;
    if (!isCurrentMonth) {
      if (day > 15) {
        // Es del mes anterior
        clickedDate = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 1,
          day
        );
        setCurrentMonth(new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 1,
          1
        ));
      } else {
        // Es del mes siguiente
        clickedDate = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          day
        );
        setCurrentMonth(new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          1
        ));
      }
    } else {
      clickedDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
    }

    // Formatear la fecha como YYYY-MM-DD
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(clickedDate.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Actualizar el mes cuando cambia el valor
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [value]);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'dd/mm/aaaa';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-[40px] pl-12 pr-4 rounded-full border flex items-center cursor-pointer
          ${error ? 'border-danger' : 'border-gray-300'}
          focus-within:ring-1 
          ${error ? 'focus-within:ring-danger' : 'focus-within:ring-primary'}
          bg-white
        `}
      >
        <span className={`text-base ${value ? 'text-gray-600' : 'text-gray-400'}`}>
          {formatDisplayDate(value)}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-2xl shadow-lg z-50 p-4 w-80"
          >
          {/* Header con navegación */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeftIcon className="w-5 h-5 text-foreground" />
            </button>
            <h3 className="text-base font-semibold text-foreground">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRightIcon className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-1">
            {/* Días de la semana */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-xs font-medium text-gray-500 text-center py-2"
              >
                {day}
              </div>
            ))}

            {/* Días del mes anterior */}
            {Array.from({ length: startingDayOfWeek }, (_, i) => {
              const day = daysInPrevMonth - startingDayOfWeek + i + 1;
              return (
                <button
                  key={`prev-${day}`}
                  onClick={() => handleDayClick(day, false)}
                  className="text-sm text-gray-400 hover:bg-gray-100 rounded-md py-2 transition-colors"
                >
                  {day}
                </button>
              );
            })}

            {/* Días del mes actual */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const todayClass = isToday(day, true) ? 'font-semibold' : '';
              const selectedClass = isSelected(day, true)
                ? 'bg-primary text-white hover:bg-primary'
                : 'hover:bg-gray-100';
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day, true)}
                  className={`text-sm ${todayClass} ${selectedClass} rounded-md py-2 transition-colors ${
                    isSelected(day, true) ? '' : 'text-foreground'
                  }`}
                >
                  {day}
                </button>
              );
            })}

            {/* Días del mes siguiente */}
            {Array.from({ length: daysInNextMonth }, (_, i) => {
              const day = i + 1;
              return (
                <button
                  key={`next-${day}`}
                  onClick={() => handleDayClick(day, false)}
                  className="text-sm text-gray-400 hover:bg-gray-100 rounded-md py-2 transition-colors"
                >
                  {day}
                </button>
              );
            })}
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

