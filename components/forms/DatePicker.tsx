'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export default function DatePicker({ value, onChange, error, required }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'year' | 'month'>('year');
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      // Parsear la fecha como local para evitar problemas de zona horaria
      const parts = value.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Los meses en JS son 0-indexed
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return new Date(date.getFullYear(), date.getMonth(), 1);
      }
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  const [yearRange, setYearRange] = useState(() => {
    const currentYear = value ? currentMonth.getFullYear() : new Date().getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    return { start: startYear, end: startYear + 9 };
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
    // Parsear la fecha como local para evitar problemas de zona horaria
    const parts = value.split('-');
    let selectedDate: Date;
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Los meses en JS son 0-indexed
      const dayValue = parseInt(parts[2], 10);
      selectedDate = new Date(year, month, dayValue);
    } else {
      selectedDate = new Date(value);
    }
    selectedDate.setHours(0, 0, 0, 0);
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    date.setHours(0, 0, 0, 0);
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

  const handlePrevYear = () => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear() - 1,
      currentMonth.getMonth(),
      1
    ));
  };

  const handleNextYear = () => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear() + 1,
      currentMonth.getMonth(),
      1
    ));
  };

  const handlePrevYearRange = () => {
    setYearRange({ start: yearRange.start - 10, end: yearRange.end - 10 });
  };

  const handleNextYearRange = () => {
    setYearRange({ start: yearRange.start + 10, end: yearRange.end + 10 });
  };

  const handleYearClick = (year: number) => {
    setCurrentMonth(new Date(year, 0, 1)); // Establecer el mes a enero (0) para evitar problemas
    setViewMode('month');
  };

  const handleMonthClick = (month: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
    setViewMode('calendar');
  };

  const handleHeaderClick = () => {
    if (viewMode === 'calendar') {
      setViewMode('month');
    } else if (viewMode === 'month') {
      setViewMode('year');
      const currentYear = currentMonth.getFullYear();
      const startYear = Math.floor(currentYear / 10) * 10;
      setYearRange({ start: startYear, end: startYear + 9 });
    }
  };

  // Resetear a vista de año cuando se abre el picker (solo cuando cambia isOpen)
  useEffect(() => {
    if (isOpen) {
      setViewMode('year');
      // Obtener el año actual sin depender de currentMonth en las dependencias
      let yearToUse: number;
      if (value) {
        const parts = value.split('-');
        if (parts.length === 3) {
          yearToUse = parseInt(parts[0], 10);
        } else {
          const date = new Date(value);
          yearToUse = date.getFullYear();
        }
      } else {
        yearToUse = new Date().getFullYear();
      }
      const startYear = Math.floor(yearToUse / 10) * 10;
      setYearRange({ start: startYear, end: startYear + 9 });
    }
  }, [isOpen]);

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
    setViewMode('calendar');
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
      // Parsear la fecha como local para evitar problemas de zona horaria
      // Si el formato es YYYY-MM-DD, parsearlo manualmente
      const parts = value.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Los meses en JS son 0-indexed
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      } else {
        const date = new Date(value);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    }
  }, [value]);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'dd/mm/aaaa';
    // Parsear la fecha como local para evitar problemas de zona horaria
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Los meses en JS son 0-indexed
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      const dayStr = String(date.getDate()).padStart(2, '0');
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const yearStr = date.getFullYear();
      return `${dayStr}/${monthStr}/${yearStr}`;
    }
    // Fallback al método anterior si el formato no es YYYY-MM-DD
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
              onClick={viewMode === 'calendar' ? handlePrevMonth : viewMode === 'month' ? handlePrevYear : handlePrevYearRange}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              aria-label={viewMode === 'calendar' ? 'Mes anterior' : viewMode === 'month' ? 'Año anterior' : 'Década anterior'}
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={handleHeaderClick}
              className="px-3 py-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              <h3 className="text-base font-semibold text-foreground">
                {viewMode === 'calendar' && `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
                {viewMode === 'month' && `${currentMonth.getFullYear()}`}
                {viewMode === 'year' && `${yearRange.start} - ${yearRange.end}`}
              </h3>
            </button>
            <button
              onClick={viewMode === 'calendar' ? handleNextMonth : viewMode === 'month' ? handleNextYear : handleNextYearRange}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              aria-label={viewMode === 'calendar' ? 'Mes siguiente' : viewMode === 'month' ? 'Año siguiente' : 'Década siguiente'}
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Vista de calendario */}
          {viewMode === 'calendar' && (
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
                    className="text-base text-gray-400 hover:bg-gray-100 rounded-md py-2 transition-colors cursor-pointer"
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
                    className={`text-base ${todayClass} ${selectedClass} rounded-md py-2 transition-colors cursor-pointer ${
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
                    className="text-base text-gray-400 hover:bg-gray-100 rounded-md py-2 transition-colors cursor-pointer"
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}

          {/* Vista de meses */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-3 gap-2">
              {monthNames.map((month, index) => {
                const isCurrentMonth = index === currentMonth.getMonth();
                return (
                  <button
                    key={month}
                    onClick={() => handleMonthClick(index)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                      isCurrentMonth
                        ? 'bg-primary text-white font-semibold'
                        : 'hover:bg-gray-100 text-foreground'
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          )}

          {/* Vista de años */}
          {viewMode === 'year' && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => {
                const year = yearRange.start + i;
                const isCurrentYear = year === currentMonth.getFullYear();
                const currentYear = new Date().getFullYear();
                const isThisYear = year === currentYear;
                return (
                  <button
                    key={year}
                    onClick={() => handleYearClick(year)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                      isCurrentYear
                        ? 'bg-primary text-white font-semibold'
                        : isThisYear
                        ? 'bg-gray-200 text-foreground font-medium'
                        : 'hover:bg-gray-100 text-foreground'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

