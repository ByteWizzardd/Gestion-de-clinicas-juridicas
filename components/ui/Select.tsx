'use client';

import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

export default function Select({ label, error, options, placeholder = "Selecciona una opción", className = "", ...props }: SelectProps) {
    return (
        <div className="flex flex-col gap-2">
            {label && (<label className="text-md font-medium">{label}</label>)}
            <div className="relative">
                <select
                    className={`w-full p-2 pr-10 rounded-md border ${error ? 'border-danger' : 'border-gray-300'} 
                        focus:outline-none focus:ring-2 ${error ? 'focus:ring-danger' : 'focus:ring-primary'}
                        appearance-none bg-white cursor-pointer transition-colors ${className}`}{...props}>
                    {placeholder && (<option value="" disabled={props.required}>{placeholder}</option>)}
                    {options.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
                <ChevronDownIcon 
                    className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none ${
                        className.includes('text-xs') ? 'right-2 w-4 h-4' : 'right-3 w-5 h-5'}`} aria-hidden="true"/>
            </div>
            {error && (<p className="text-md text-danger">{error}</p>)}
        </div>
    );
}