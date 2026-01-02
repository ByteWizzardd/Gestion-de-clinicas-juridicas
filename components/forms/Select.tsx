    'use client';


import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from 'motion/react';
import DropdownMenu from '../ui/navigation/DropdownMenu';

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
    icon?: React.ReactNode;
    disabled?: boolean;
}

export default function Select({ label, error, options, placeholder = "Selecciona una opción", value = "", onChange, className = "", icon, disabled = false }: SelectProps) {

    const selectedOption = options.find((opt) => opt.value === value);
    const handleSelect = (optionValue: string) => {
        if (disabled) return;
        if (onChange) {
            const syntheticEvent = {
                target: { value: optionValue }
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange(syntheticEvent);
        }
    };

    const triggerButton = (isOpenState: boolean) => (
        <button
            type="button"
            disabled={disabled}
            className={`
                w-full h-10 ${icon ? 'pl-4 pr-4' : 'pl-5 pr-4'} rounded-3xl border overflow-hidden flex items-center gap-3 justify-between
                ${error ? 'border-danger' : 'border-transparent shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]'}
                outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0
                ${error ? 'focus:ring-1 focus:ring-danger' : ''}
                ${disabled 
                    ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                    : 'bg-white cursor-pointer'
                }
                text-neutral-800/90 text-left font-normal
                ${className || 'text-base'}
            `}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {icon && <span className="shrink-0">{icon}</span>}
                <span className={`truncate ${selectedOption ? 'text-neutral-800/90' : 'text-neutral-600'} ${disabled ? 'text-gray-500' : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
            </div>
            <ChevronDown
                className={`w-4 h-4 transition-transform shrink-0 ${disabled ? 'text-gray-400' : 'text-neutral-700'} ${isOpenState ? 'transform rotate-180' : ''}`}
            />
        </button>
    );

    return (
        <div className="flex flex-col gap-1">
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
            <DropdownMenu
                trigger={triggerButton}
                align="left"
                className="w-full"
                menuClassName="w-full"
                disabled={disabled}
            >
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto py-1"
                    >
                        {options.length > 0 ? (
                            options.map((option, index) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    data-close-menu
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer
                                        ${value === option.value ? 'bg-primary-light text-primary font-medium' : ''}
                                        ${index === 0 ? 'rounded-t-xl' : ''}
                                        ${index === options.length - 1 ? 'rounded-b-xl' : ''}
                                    `}
                                >
                                    {option.label}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2.5 text-base text-gray-500 text-center">
                                No hay opciones disponibles
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </DropdownMenu>
            {error && (<p className="text-xs text-danger mt-1">{error}</p>)}
        </div>
    );
}