'use client';

import { useState } from 'react';
import Modal from '../ui/feedback/Modal';
import Button from '../ui/Button';
import { X } from 'lucide-react';

interface CatalogFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => void;
    title: string;
    fields: {
        name: string;
        label: string;
        type?: 'text' | 'number' | 'select';
        required?: boolean;
        options?: { value: string; label: string }[];
    }[];
    onFieldChange?: (fieldName: string, value: string) => void;
}

export default function CatalogFormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    fields,
    onFieldChange
}: CatalogFormModalProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        // Validate required fields
        fields.forEach(field => {
            if (field.required && !formData[field.name]?.trim()) {
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
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        // Call the onChange callback if provided
        if (onFieldChange) {
            onFieldChange(name, value);
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
                            <label className="block text-sm font-medium text-foreground mb-1">
                                {field.label}
                                {field.required && <span className="text-danger ml-1">*</span>}
                            </label>

                            {field.type === 'select' && field.options ? (
                                <select
                                    value={formData[field.name] || ''}
                                    onChange={(e) => updateField(field.name, e.target.value)}
                                    className={`w-full px-4 py-2 rounded-full border ${errors[field.name] ? 'border-danger' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                                >
                                    <option value="">Seleccionar...</option>
                                    {field.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type || 'text'}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => updateField(field.name, e.target.value)}
                                    className={`w-full px-4 py-2 rounded-full border ${errors[field.name] ? 'border-danger' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                                    placeholder={`Ingrese ${field.label.toLowerCase()}`}
                                />
                            )}

                            {errors[field.name] && (
                                <p className="text-danger text-sm mt-1">{errors[field.name]}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button variant="secondary" onClick={handleClose}>
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
