'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/feedback/Modal';
import { X, FileText, Calendar, User, Hash, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface ViewField {
    label: string;
    value: string | number | boolean | null | undefined;
    icon?: React.ElementType;
    fullWidth?: boolean;
}

interface CatalogViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: ViewField[];
}

export default function CatalogViewModal({ isOpen, onClose, title, fields }: CatalogViewModalProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setIsModalOpen(isOpen);
    }, [isOpen]);

    const handleClose = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const formatValue = (value: any) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') {
            return value ? (
                <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-sm">
                    <CheckCircle2 className="w-3 h-3" /> Sí
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-sm">
                    <AlertCircle className="w-3 h-3" /> No
                </span>
            );
        }
        return String(value);
    };

    const getIcon = (Icon: React.ElementType | undefined) => {
        if (Icon) return <Icon className="w-5 h-5 text-primary" />;
        return <Info className="w-5 h-5 text-primary" />;
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={handleClose}
            size="custom"
            className="rounded-[30px] max-w-[600px] mx-auto"
            showCloseButton={false}
        >
            <div className="p-8 relative">
                {/* Botón de cerrar */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
                    aria-label="Cerrar modal"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Título */}
                <h2 className="text-2xl font-normal text-foreground mb-4 pr-10">
                    {title}
                </h2>

                {/* Línea divisoria naranja */}
                <div className="border-b-2 border-secondary w-full mb-8"></div>

                {/* Contenido organizado en dos columnas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    {fields.map((field, index) => (
                        <div key={index} className={`${field.fullWidth ? 'col-span-1 sm:col-span-2' : ''}`}>
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                                    {getIcon(field.icon)}
                                    {field.label}
                                </label>
                                <div className="text-base text-gray-900 wrap-break-words">
                                    {formatValue(field.value)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
}
