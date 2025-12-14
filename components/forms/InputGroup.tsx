'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

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
}

function SelectSmall({ value, onChange, options, className = '', error = false }: SelectSmallProps) {
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
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-[40px] px-3 pr-8 rounded-full border flex items-center justify-between
          ${error ? 'border-danger' : 'border-gray-300'}
          focus:outline-none focus:ring-1 focus:ring-primary
          bg-white cursor-pointer transition-colors
          text-base font-normal text-foreground
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
        {isOpen && (
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

interface InputGroupProps {
  label?: string;
  selectValue: string;
  selectOptions: { value: string; label: string }[];
  onSelectChange: (value: string) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  inputPlaceholder?: string;
  error?: string;
  selectWidth?: string;
  editableCode?: boolean; // Si es true, el código de país será un input editable
}

export default function InputGroup({
  label,
  selectValue,
  selectOptions,
  onSelectChange,
  inputValue,
  onInputChange,
  inputPlaceholder,
  error,
  selectWidth = 'w-14',
  editableCode = false,
}: InputGroupProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<{ value: string; label: string }[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filtrar opciones basadas en el valor del input
  useEffect(() => {
    if (!editableCode) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (selectValue.trim().length === 0) {
      setFilteredOptions(selectOptions);
      // No mostrar sugerencias si el campo está vacío
      setShowSuggestions(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      const filtered = selectOptions.filter((option) =>
        option.value.toLowerCase().includes(selectValue.toLowerCase()) ||
        option.label.toLowerCase().includes(selectValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      // Solo mostrar sugerencias si el campo tiene focus
      if (isFocused) {
        setShowSuggestions(filtered.length > 0);
      }
    }, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectValue, selectOptions, editableCode]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    if (!editableCode) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editableCode]);

  const handleSelectSuggestion = (option: { value: string; label: string }) => {
    onSelectChange(option.value);
    setShowSuggestions(false);
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
      <div className="flex items-center gap-2">
        {/* Código de país: Select o Input con autocompletado según editableCode */}
        {editableCode ? (
          <div className={`${selectWidth} relative`}>
            <input
              type="text"
              value={selectValue}
              onChange={(e) => {
                onSelectChange(e.target.value);
                // Filtrar opciones mientras el usuario escribe
                if (isFocused) {
                  const filtered = selectOptions.filter((option) =>
                    option.value.toLowerCase().includes(e.target.value.toLowerCase()) ||
                    option.label.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  setFilteredOptions(filtered);
                  setShowSuggestions(filtered.length > 0);
                }
              }}
              onFocus={() => {
                setIsFocused(true);
                // Solo mostrar sugerencias cuando el usuario hace focus
                if (selectValue.trim().length === 0) {
                  setFilteredOptions(selectOptions);
                  setShowSuggestions(selectOptions.length > 0);
                } else {
                  // Si hay un valor, filtrar y mostrar sugerencias
                  const filtered = selectOptions.filter((option) =>
                    option.value.toLowerCase().includes(selectValue.toLowerCase()) ||
                    option.label.toLowerCase().includes(selectValue.toLowerCase())
                  );
                  setFilteredOptions(filtered);
                  setShowSuggestions(filtered.length > 0);
                }
              }}
              onBlur={() => {
                setIsFocused(false);
                // Ocultar sugerencias cuando el campo pierde el foco
                // Usamos setTimeout para permitir que el click en una sugerencia se procese primero
                setTimeout(() => {
                  setShowSuggestions(false);
                }, 200);
              }}
              placeholder="+58"
              className={`
                w-full h-[40px] px-3 rounded-full border
                ${error ? 'border-danger' : 'border-transparent'} bg-[#E5E7EB]
                focus:outline-none focus:ring-1 
                ${error ? 'focus:ring-danger' : 'focus:ring-primary'}
                text-base placeholder:text-[#717171]
              `}
            />
            {/* Lista de sugerencias */}
            <AnimatePresence>
              {showSuggestions && (filteredOptions.length > 0 || (selectValue.trim().length === 0 && selectOptions.length > 0)) && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {(selectValue.trim().length === 0 ? selectOptions : filteredOptions).map((option, index) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectSuggestion(option)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.15 }}
                      className={`
                        w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors
                        ${selectValue === option.value ? 'bg-primary-light text-primary font-medium' : ''}
                        ${index === 0 ? 'rounded-t-md' : ''}
                        ${index === filteredOptions.length - 1 ? 'rounded-b-md' : ''}
                      `}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <SelectSmall
            value={selectValue}
            onChange={onSelectChange}
            options={selectOptions}
            className={selectWidth}
            error={!!error}
          />
        )}
        {/* Input */}
        <div className="flex-1">
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={inputPlaceholder}
            className={`
              w-full h-[40px] px-4 rounded-full border
              ${error ? 'border-danger' : 'border-transparent'} bg-[#E5E7EB]
              focus:outline-none focus:ring-1 
              ${error ? 'focus:ring-danger' : 'focus:ring-primary'}
              text-base placeholder:text-[#717171]
            `}
          />
        </div>
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

