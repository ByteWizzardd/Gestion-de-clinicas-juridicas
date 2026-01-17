'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { createPortal } from 'react-dom';

interface DatePickerProps {
  value: string | Date;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
}

export default function DatePicker({ value, onChange, error, required, disabled = false, label }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'year' | 'month'>('year');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [isInsideModal, setIsInsideModal] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      // Si ya es un objeto Date
      if (value instanceof Date) {
        return new Date(value.getFullYear(), value.getMonth(), 1);
      }

      // Si es un string
      if (typeof value === 'string') {
        const parts = value.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const date = new Date(year, month, day);
          return new Date(date.getFullYear(), date.getMonth(), 1);
        }
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return new Date(date.getFullYear(), date.getMonth(), 1);
        }
      }
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const [yearRange, setYearRange] = useState(() => {
    const currentYear = value ? currentMonth.getFullYear() : new Date().getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    return { start: startYear, end: startYear + 9 };
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Detectar si está dentro de un modal
    if (dropdownRef.current) {
      const parentModal = dropdownRef.current.closest('[role="dialog"]') ||
        dropdownRef.current.closest('[aria-modal="true"]') ||
        dropdownRef.current.closest('[data-modal]');
      setIsInsideModal(!!parentModal);
    }
  }, []);

  // Calcular posición para el Portal
  const updatePosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const calendarHeight = 320;

      const shouldOpenUp = spaceBelow < calendarHeight && spaceAbove > spaceBelow;
      setOpenUpward(shouldOpenUp);

      setCoords({
        top: shouldOpenUp ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
  const startingDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

  const prevMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    0
  );
  const daysInPrevMonth = prevMonth.getDate();

  const rowsNeeded = Math.ceil((startingDayOfWeek + daysInMonth) / 7);
  const totalCells = rowsNeeded * 7;
  const daysInNextMonth = totalCells - startingDayOfWeek - daysInMonth;

  const isToday = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return date.getTime() === today.getTime();
  };

  const isSelected = (day: number, isCurrentMonth: boolean) => {
    if (!value || !isCurrentMonth) return false;

    let selectedDate: Date;
    if (value instanceof Date) {
      selectedDate = new Date(value);
    } else if (typeof value === 'string') {
      const parts = value.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const dayValue = parseInt(parts[2], 10);
        selectedDate = new Date(year, month, dayValue);
      } else {
        selectedDate = new Date(value);
      }
    } else {
      return false;
    }

    if (isNaN(selectedDate.getTime())) return false;

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
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePrevYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  };

  const handleNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  };

  const handlePrevYearRange = () => {
    setYearRange({ start: yearRange.start - 10, end: yearRange.end - 10 });
  };

  const handleNextYearRange = () => {
    setYearRange({ start: yearRange.start + 10, end: yearRange.end + 10 });
  };

  const handleYearClick = (year: number) => {
    setCurrentMonth(new Date(year, 0, 1));
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

  useEffect(() => {
    if (isOpen) {
      setViewMode('year');
      let yearToUse: number;
      if (value) {
        if (value instanceof Date) {
          yearToUse = value.getFullYear();
        } else if (typeof value === 'string') {
          const parts = value.split('-');
          if (parts.length === 3) {
            yearToUse = parseInt(parts[0], 10);
          } else {
            const date = new Date(value);
            yearToUse = isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
          }
        } else {
          yearToUse = new Date().getFullYear();
        }
      } else {
        yearToUse = new Date().getFullYear();
      }
      const startYear = Math.floor(yearToUse / 10) * 10;
      setYearRange({ start: startYear, end: startYear + 9 });
    }
  }, [isOpen, value]);

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    let clickedDate: Date;
    if (!isCurrentMonth) {
      if (day > 15) {
        clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, day);
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
      } else {
        clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
      }
    } else {
      clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    }

    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(clickedDate.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
    setViewMode('calendar');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Solo cerrar si el clic no es dentro del portal del calendario
        const portal = document.querySelector('.datepicker-portal');
        if (portal && portal.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (value) {
      if (value instanceof Date) {
        setCurrentMonth(new Date(value.getFullYear(), value.getMonth(), 1));
      } else if (typeof value === 'string') {
        const parts = value.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const date = new Date(year, month, day);
          setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        } else {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
          }
        }
      }
    }
  }, [value]);

  const formatDisplayDate = (dateVal: any) => {
    if (!dateVal) return 'dd/mm/aaaa';

    let date: Date;

    if (dateVal instanceof Date) {
      date = dateVal;
    } else if (typeof dateVal === 'string') {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        date = new Date(year, month, day);
      } else {
        date = new Date(dateVal);
      }
    } else {
      return 'dd/mm/aaaa';
    }

    if (isNaN(date.getTime())) return 'dd/mm/aaaa';

    const dayStr = String(date.getDate()).padStart(2, '0');
    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
    return `${dayStr}/${monthStr}/${date.getFullYear()}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`
          w-full h-[40px] pl-12 pr-4 rounded-full border flex items-center relative
          ${error ? 'border-danger' : 'border-gray-300'}
          focus-within:ring-1 
          ${error ? 'focus-within:ring-danger' : 'focus-within:ring-primary'}
          bg-white
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Calendar className="absolute left-4 w-5 h-5 text-gray-400" />
        <span className={`text-base ${value ? 'text-gray-600' : 'text-gray-400'}`}>
          {formatDisplayDate(value)}
        </span>
      </div>

      {mounted && isOpen && createPortal(
        <motion.div
          initial={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="datepicker-portal"
          style={{
            position: 'fixed',
            top: openUpward ? coords.top - 4 : coords.top + 4,
            left: coords.left,
            width: coords.width,
            minWidth: 250,
            zIndex: isInsideModal ? 99999 : 10001,
            pointerEvents: 'auto',
            transform: openUpward ? 'translateY(-100%)' : 'none',
            backgroundColor: 'white',
            border: '1px solid #D1D5DB',
            borderRadius: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '0.5rem'
          }}
        >
          {/* Header con navegación */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={viewMode === 'calendar' ? handlePrevMonth : viewMode === 'month' ? handlePrevYear : handlePrevYearRange}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <button
              type="button"
              onClick={handleHeaderClick}
              className="px-2 py-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {viewMode === 'calendar' && `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
                {viewMode === 'month' && `${currentMonth.getFullYear()}`}
                {viewMode === 'year' && `${yearRange.start} - ${yearRange.end}`}
              </h3>
            </button>
            <button
              type="button"
              onClick={viewMode === 'calendar' ? handleNextMonth : viewMode === 'month' ? handleNextYear : handleNextYearRange}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Vista de calendario */}
          {viewMode === 'calendar' && (
            <div className="grid grid-cols-7 gap-0.5">
              {dayNames.map((day) => (
                <div key={day} className="text-[10px] font-medium text-gray-500 text-center py-1">{day}</div>
              ))}
              {Array.from({ length: startingDayOfWeek }, (_, i) => {
                const day = daysInPrevMonth - startingDayOfWeek + i + 1;
                return (
                  <button key={`prev-${day}`} type="button" onClick={() => handleDayClick(day, false)} className="text-sm text-gray-400 hover:bg-gray-100 rounded-md py-1">
                    {day}
                  </button>
                );
              })}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const todayClass = isToday(day, true) ? 'font-semibold' : '';
                const selectedClass = isSelected(day, true) ? 'bg-primary text-white' : 'hover:bg-gray-100';
                return (
                  <button key={day} type="button" onClick={() => handleDayClick(day, true)} className={`text-sm ${todayClass} ${selectedClass} rounded-md py-1`}>
                    {day}
                  </button>
                );
              })}
              {Array.from({ length: daysInNextMonth }, (_, i) => {
                const day = i + 1;
                return (
                  <button key={`next-${day}`} type="button" onClick={() => handleDayClick(day, false)} className="text-sm text-gray-400 hover:bg-gray-100 rounded-md py-1">
                    {day}
                  </button>
                );
              })}
            </div>
          )}

          {/* Vista de meses */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-3 gap-1">
              {monthNames.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthClick(index)}
                  className={`px-1 py-1.5 text-sm text-center rounded-md transition-colors ${index === currentMonth.getMonth() ? 'bg-primary text-white font-semibold' : 'hover:bg-gray-100'}`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* Vista de años */}
          {viewMode === 'year' && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => {
                const year = yearRange.start + i;
                const isCurrentYear = year === currentMonth.getFullYear();
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearClick(year)}
                    className={`px-2 py-1.5 text-sm rounded-md transition-colors ${isCurrentYear ? 'bg-primary text-white font-semibold' : 'hover:bg-gray-100'}`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>,
        document.body
      )}
    </div>
  );
}

