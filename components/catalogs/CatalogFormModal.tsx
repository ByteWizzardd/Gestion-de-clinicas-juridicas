'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/feedback/Modal';
import Button from '../ui/Button';
import Select from '../forms/Select';
import DatePicker from '../forms/DatePicker';
import { X } from 'lucide-react';

interface CatalogFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => void;
    title: string;
    fields: {
        name: string;
        label: string;
        type?: 'text' | 'number' | 'select' | 'date';
        required?: boolean;
        options?: { value: string; label: string }[];
        defaultValue?: string; // For edit mode
    }[];
    onFieldChange?: (fieldName: string, value: string) => void | Record<string, string>;
}

export default function CatalogFormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    fields,
    onFieldChange
}: CatalogFormModalProps) {
    // Initialize formData with defaultValues if provided
    const initialFormData = fields.reduce((acc, field) => {
        if (field.defaultValue) {
            acc[field.name] = field.defaultValue;
        }
        return acc;
    }, {} as Record<string, string>);

    const [formData, setFormData] = useState<Record<string, string>>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form data when the modal opens with new fields/defaultValues
    useEffect(() => {
        if (isOpen) {
            const newFormData = fields.reduce((acc, field) => {
                if (field.defaultValue) {
                    acc[field.name] = field.defaultValue;
                }
                return acc;
            }, {} as Record<string, string>);
            setFormData(newFormData);
            setErrors({});
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        // Validate required fields
        // Validate required fields
        fields.forEach(field => {
            const value = formData[field.name];
            const isEmpty = value === null || value === undefined || (typeof value === 'string' && !value.trim()) || (value === '');

            if (field.required && isEmpty) {
                newErrors[field.name] = 'Este campo es requerido';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({});
        setErrors({});
        onClose();
    };

    const updateField = (name: string, value: string) => {
        setFormData(prev => {
            const nextData = { ...prev, [name]: value };
            return nextData;
        });

        // Call the onChange callback after state update using useEffect
        if (onFieldChange) {
            // Use setTimeout to defer the callback until after render
            setTimeout(() => {
                const updates = onFieldChange(name, value);
                // If callback returns an object, merge it (e.g., to clear dependent fields)
                if (updates && typeof updates === 'object') {
                    setFormData(prev => ({ ...prev, ...updates }));
                }
            }, 0);
        }

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="lg"
            showCloseButton={false}
        >
            <div className="p-8 relative">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Cerrar modal"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Title */}
                <h2 className="text-2xl font-semibold text-foreground mb-6">{title}</h2>

                {/* Form fields */}
                <div className="space-y-4 mb-6">
                    {fields.map(field => (
                        <div key={field.name}>
                            {field.type === 'select' && field.options ? (
                                <Select
                                    label={field.required ? `${field.label} *` : field.label}
                                    options={field.options}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => updateField(field.name, e.target.value)}
                                    placeholder="Seleccionar..."
                                    error={errors[field.name]}
                                />
                            ) : field.type === 'date' ? (
                                <div className="space-y-1">
                                    <label className="block text-base font-normal text-foreground">
                                        {field.label}
                                        {field.required && <span className="text-danger ml-1">*</span>}
                                    </label>
                                    <DatePicker
                                        value={formData[field.name] || ''}
                                        onChange={(value) => updateField(field.name, value)}
                                        error={errors[field.name]}
                                        required={field.required}
                                    />
                                    {errors[field.name] && (
                                        <p className="text-xs text-danger mt-1">{errors[field.name]}</p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <label className="block text-base font-normal text-foreground mb-1">
                                        {field.label}
                                        {field.required && <span className="text-danger ml-1">*</span>}
                                    </label>
                                    <input
                                        type={field.type || 'text'}
                                        value={formData[field.name] || ''}
                                        onChange={(e) => updateField(field.name, e.target.value)}
                                        className={`w-full h-[40px] px-4 rounded-full border ${errors[field.name] ? 'border-danger' : 'border-transparent'} bg-[#E5E7EB] text-base placeholder:text-[#717171] focus:outline-none focus:ring-1 ${errors[field.name] ? 'focus:ring-danger' : 'focus:ring-primary'}`}
                                        placeholder={`Ingrese ${field.label.toLowerCase()}`}
                                    />
                                    {errors[field.name] && (
                                        <p className="text-xs text-danger mt-1">{errors[field.name]}</p>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button variant="outline" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Guardar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
