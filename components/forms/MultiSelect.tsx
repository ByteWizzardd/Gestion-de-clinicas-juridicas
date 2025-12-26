'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from "lucide-react";
import { AnimatePresence, motion } from 'motion/react';
import DropdownMenu from '../ui/navigation/DropdownMenu';

interface MultiSelectOption {
    value: string;
    label: string;
}

interface MultiSelectProps {
    label?: string;
    error?: string;
    options: MultiSelectOption[];
    placeholder?: string;
    value?: string[];
    onChange?: (values: string[]) => void;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}

export default function MultiSelect({ 
    label, 
    error, 
    options, 
    placeholder = "Selecciona opciones", 
    value = [], 
    onChange, 
    required, 
    className = "", 
    disabled = false 
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    // Filtrar opciones basándose en el término de búsqueda
    const filteredOptions = options.filter((option) => {
        if (!searchTerm.trim()) return true;
        const searchLower = searchTerm.toLowerCase().trim();
        return option.label.toLowerCase().includes(searchLower);
    });

    const handleToggle = (optionValue: string) => {
        if (disabled) return;
        
        const newValues = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue];
        
        if (onChange) {
            onChange(newValues);
        }
    };

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        
        const newValues = value.filter((v) => v !== optionValue);
        if (onChange) {
            onChange(newValues);
        }
    };

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm(''); // Limpiar búsqueda al cerrar
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Enfocar el input de búsqueda cuando se abre el dropdown
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            setSearchTerm(''); // Limpiar búsqueda al cerrar
        }
    }, [isOpen]);

    const triggerButton = (isOpenState: boolean) => (
        <button
            type="button"
            disabled={disabled}
            className={`
                w-full min-h-10 ${selectedOptions.length > 0 ? 'py-2' : 'py-2.5'} px-5 rounded-3xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] 
                overflow-hidden flex items-center gap-3 justify-between
                outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0
                bg-white cursor-pointer
                text-neutral-800/90 text-left font-normal
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${error ? 'border border-danger' : ''}
                ${className || 'text-base'}
            `}
        >
            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                {selectedOptions.length > 0 ? (
                    selectedOptions.map((option) => (
                        <span
                            key={option.value}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-light text-primary rounded-lg text-sm"
                        >
                            <span className="truncate max-w-[150px]">{option.label}</span>
                            {!disabled && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => handleRemove(option.value, e)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleRemove(option.value, e as any);
                                        }
                                    }}
                                    className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <X className="w-3 h-3" />
                                </span>
                            )}
                        </span>
                    ))
                ) : (
                    <span className="text-neutral-600">{placeholder}</span>
                )}
            </div>
            <ChevronDown
                className={`w-4 h-4 text-neutral-700 transition-transform flex-shrink-0 ${isOpenState ? 'transform rotate-180' : ''}`}
            />
        </button>
    );

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
            <DropdownMenu
                trigger={triggerButton}
                align="left"
                className="w-full"
                menuClassName="w-full"
                onOpenChange={setIsOpen}
            >
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col"
                    >
                        {/* Campo de búsqueda */}
                        <div className="px-3 pt-2 pb-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por nombre..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                        // Prevenir que Enter cierre el dropdown
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        
                        {/* Lista de opciones filtradas */}
                        <div className="overflow-y-auto max-h-48">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => {
                                    const isSelected = value.includes(option.value);
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleToggle(option.value)}
                                            className={`
                                                w-full px-4 py-2.5 text-left text-base transition-colors cursor-pointer
                                                flex items-center gap-2
                                                ${isSelected 
                                                    ? 'bg-primary-light text-primary font-medium' 
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                                }
                                            `}
                                        >
                                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                                                isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                                            }`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="truncate">{option.label}</span>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-2.5 text-base text-gray-500 text-center">
                                    {searchTerm.trim() ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </DropdownMenu>
            {error && (<p className="text-xs text-danger mt-1">{error}</p>)}
        </div>
    );
}

