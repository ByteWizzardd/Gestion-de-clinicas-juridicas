'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from 'motion/react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    className?: string;
}

export default function Select({ label, error, options, placeholder = "Selecciona una opción", value = "", onChange, required, className = "" }: SelectProps) {
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
        if (onChange) {
            // Crear un evento sintético para mantener compatibilidad
            const syntheticEvent = {
                target: { value: optionValue }
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange(syntheticEvent);
        }
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col gap-1">
            {label && (<label className="text-base font-normal text-foreground mb-1">{label}</label>)}
            <div className="relative" ref={selectRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-full h-[40px] px-4 pr-8 rounded-full border flex items-center justify-between
                        ${error ? 'border-danger' : 'border-gray-300'}
                        focus:outline-none focus:ring-1 
                        ${error ? 'focus:ring-danger' : 'focus:ring-primary'}
                        bg-white cursor-pointer transition-colors
                        text-base text-foreground text-left
                        ${className}
                    `}
                >
                    <span className={selectedOption ? 'text-foreground' : 'text-[#717171]'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDownIcon 
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
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
                                        w-full px-4 py-2 text-left text-base text-foreground hover:bg-gray-100 transition-colors
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
            {error && (<p className="text-xs text-danger mt-1">{error}</p>)}
        </div>
    );
}