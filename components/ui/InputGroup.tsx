'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
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
        <ChevronDownIcon
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
}: InputGroupProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-base font-normal text-foreground mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        {/* Select pequeño */}
        <SelectSmall
          value={selectValue}
          onChange={onSelectChange}
          options={selectOptions}
          className={selectWidth}
          error={!!error}
        />
        {/* Input */}
        <div className="flex-1">
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={inputPlaceholder}
            className={`
              w-full h-[40px] px-4 rounded-full border
              ${error ? 'border-danger' : 'border-transparent bg-[#E5E7EB]'}
              focus:outline-none focus:ring-1 
              ${error ? 'focus:ring-danger' : 'focus:ring-primary'}
              text-base placeholder:text-[#717171]
            `}
          />
          {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}

