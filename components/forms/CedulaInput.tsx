'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface Solicitante {
  cedula: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectSmallProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

function SelectSmall({ value, onChange, options, className = '', error = false, disabled = false }: SelectSmallProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
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

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-[40px] px-3 pr-8 rounded-full border flex items-center justify-between
          ${error ? 'border-danger' : 'border-gray-300'}
          focus:outline-none focus:ring-1 focus:ring-primary
          bg-white transition-colors
          text-base font-normal text-foreground
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
        `}
      >
        <span className={selectedOption ? 'text-foreground' : 'text-[#717171]'}>
          {selectedOption ? selectedOption.label : 'V'}
        </span>
        <ChevronDown
          className={`absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 text-gray-400 transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-hidden"
          >
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2 text-left text-base text-foreground hover:bg-gray-100 transition-colors
                  ${value === option.value ? 'bg-primary-light text-primary font-medium' : ''}
                  ${index === 0 ? 'rounded-t-2xl' : ''}
                  ${index === options.length - 1 ? 'rounded-b-2xl' : ''}
                `}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type SearchType = 'solicitante' | 'profesor' | 'estudiante';

interface CedulaInputProps {
  label: string;
  tipoValue?: string;
  onTipoChange?: (value: string) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  onSelectCedula?: (cedula: string) => void;
  searchType?: SearchType; // Tipo de búsqueda: solicitante, profesor o estudiante
  disableSuggestions?: boolean; // Desactivar recomendaciones automáticas
  disabled?: boolean;
}

export default function CedulaInput({
  label,
  tipoValue = 'V',
  onTipoChange,
  value,
  onChange,
  placeholder,
  error,
  required,
  onSelectCedula,
  searchType = 'solicitante',
  disableSuggestions = false,
  disabled = false,
}: CedulaInputProps) {
  const [suggestions, setSuggestions] = useState<Solicitante[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tipoOptions = [
    { value: 'V', label: 'V' },
    { value: 'E', label: 'E' },
  ];

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Buscar cédulas mientras el usuario escribe (con debounce)
  useEffect(() => {
    // Si las sugerencias están desactivadas, no buscar
    if (disableSuggestions) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        // Buscar con el tipo de cédula incluido y el guión (formato: V-XXXX)
        const searchQuery = tipoValue ? `${tipoValue}-${value.trim()}` : value.trim();

        let result;
        if (searchType === 'profesor') {
          const { searchProfesoresAction } = await import('@/app/actions/profesores');
          result = await searchProfesoresAction(searchQuery);
        } else if (searchType === 'estudiante') {
          const { searchEstudiantesAction } = await import('@/app/actions/estudiantes');
          result = await searchEstudiantesAction(searchQuery);
        } else {
          // searchType === 'solicitante'
          const { searchSolicitantesAction } = await import('@/app/actions/solicitantes');
          result = await searchSolicitantesAction(searchQuery, 'cedula');
        }

        if (result.success && result.data) {
          setSuggestions(result.data as Solicitante[]);
          setShowSuggestions(result.data.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error al buscar cédulas:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce de 300ms

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, tipoValue, searchType, disableSuggestions]);

  const handleSelectSuggestion = (solicitante: Solicitante) => {
    // Separar el tipo de cédula del número
    // La cédula viene como "V-12345678" (con guión)
    let tipoCedula = tipoValue;
    let numeroCedula = solicitante.cedula;

    // Si la cédula tiene formato "V-XXXX", extraer el tipo y el número
    const cedulaMatch = solicitante.cedula.match(/^([VE])-?(.+)$/);
    if (cedulaMatch) {
      tipoCedula = cedulaMatch[1];
      numeroCedula = cedulaMatch[2]; // Ya viene sin el guión después del tipo
    } else if (solicitante.cedula.match(/^[VE]/)) {
      // Fallback: si viene como "V12345678" (sin guión), extraer el tipo
      tipoCedula = solicitante.cedula[0];
      numeroCedula = solicitante.cedula.substring(1);
    }

    // Actualizar el tipo si hay callback
    if (onTipoChange && tipoCedula !== tipoValue) {
      onTipoChange(tipoCedula);
    }

    // Actualizar el número de cédula
    const syntheticEvent = {
      target: { value: numeroCedula },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
    setShowSuggestions(false);

    if (onSelectCedula) {
      onSelectCedula(solicitante.cedula);
    }
  };

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      {label && (
        <label className="text-base font-normal text-foreground mb-1">
          {label.split(' *').map((part, index, array) =>
            index < array.length - 1 ? (
              <span key={index}>
                {part} <span className="text-danger">*</span>
              </span>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </label>
      )}
      <div className="flex items-center gap-2 relative">
        {/* Select pequeño para tipo de cédula */}
        <SelectSmall
          value={tipoValue}
          onChange={(val) => {
            if (onTipoChange) {
              onTipoChange(val);
            }
          }}
          options={tipoOptions}
          className="w-14"
          error={!!error}
          disabled={disabled}
        />
        {/* Input de cédula */}
        <div className="flex-1 relative">
          <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            onFocus={() => {
              if (!disabled && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className={`
              w-full h-[40px] px-4 rounded-full border bg-[#E5E7EB]
              ${error ? 'border-danger' : 'border-transparent'}
              focus:outline-none focus:ring-1 
              ${error ? 'focus:ring-danger' : 'focus:ring-primary'}
              text-base placeholder:text-[#717171]
              ${disabled ? 'opacity-50 cursor-not-allowed text-gray-500' : ''}
            `}
            required={required}
          />

          {/* Lista de sugerencias */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && !disabled && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {isSearching && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-2 text-sm text-gray-500"
                  >
                    Buscando...
                  </motion.div>
                )}
                {!isSearching && suggestions.map((solicitante, index) => (
                  <motion.button
                    key={solicitante.cedula}
                    type="button"
                    onClick={() => handleSelectSuggestion(solicitante)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.15 }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <div className="font-medium text-gray-900">{solicitante.cedula}</div>
                    <div className="text-sm text-gray-600">{solicitante.nombre_completo}</div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
