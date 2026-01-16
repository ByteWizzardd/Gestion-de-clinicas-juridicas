'use client';

import { useState } from 'react';
import Modal from '@/components/ui/feedback/Modal';
import Button from '@/components/ui/Button';
import TextArea from '@/components/forms/TextArea';
import Select from '@/components/forms/Select';
import { X } from 'lucide-react';

interface ChangeStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (motivo: string, nuevoEstatus: string) => Promise<void>;
    estatusActual: string;
    isSubmitting: boolean;
    estatusOptions: { value: string; label: string }[];
}

export default function ChangeStatusModal({
    isOpen,
    onClose,
    onConfirm,
    estatusActual,
    isSubmitting,
    estatusOptions,
}: ChangeStatusModalProps) {
    const [motivo, setMotivo] = useState('');
    const [nuevoEstatus, setNuevoEstatus] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ motivo?: string; nuevoEstatus?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setErrors({});

        let hasErrors = false;
        const newErrors: { motivo?: string; nuevoEstatus?: string } = {};

        if (!nuevoEstatus) {
            newErrors.nuevoEstatus = 'Debe seleccionar un nuevo estatus';
            hasErrors = true;
        }

        if (!motivo.trim()) {
            newErrors.motivo = 'El motivo es requerido';
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors(newErrors);
            return;
        }

        await onConfirm(motivo.trim(), nuevoEstatus);
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setMotivo('');
            setNuevoEstatus('');
            setError(null);
            setErrors({});
            onClose();
        }
    };

    // Status badge helper
    const getStatusColor = (estatus: string) => {
        const colors: Record<string, string> = {
            'En proceso': 'bg-blue-100 text-blue-800',
            'Archivado': 'bg-gray-100 text-gray-800',
            'Entregado': 'bg-green-100 text-green-800',
            'Asesoría': 'bg-purple-100 text-purple-800',
        };
        return colors[estatus] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="custom"
            className="rounded-[30px] max-w-[600px] mx-auto"
            showCloseButton={false}
        >
            <div className="flex flex-col relative w-full">
                {/* Header fijo */}
                <div className="flex-shrink-0 p-8 pb-4 relative border-b border-gray-200">
                    {/* Botón de cerrar */}
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
                        aria-label="Cerrar modal"
                        disabled={isSubmitting}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Título */}
                    <h2 className="text-2xl font-normal text-foreground">
                        Cambiar Estatus del Caso
                    </h2>

                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Estatus actual:</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(estatusActual)}`}>
                            {estatusActual}
                        </span>
                    </div>
                </div>

                {/* Área de contenido */}
                <div className="px-8 py-6">
                    <form
                        id="change-status-form"
                        onSubmit={handleSubmit}
                        noValidate
                        className="flex flex-col gap-6"
                    >
                        {/* Nuevo Estatus */}
                        <div>
                            <Select
                                label="Nuevo Estatus *"
                                options={estatusOptions}
                                value={nuevoEstatus}
                                onChange={(e) => {
                                    setNuevoEstatus(e.target.value);
                                    if (errors.nuevoEstatus) {
                                        setErrors(prev => ({ ...prev, nuevoEstatus: undefined }));
                                    }
                                }}
                                error={errors.nuevoEstatus}
                                placeholder="Seleccione el nuevo estatus"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        {/* Motivo */}
                        <div>
                            <TextArea
                                label="Motivo del cambio *"
                                value={motivo}
                                onChange={(e) => {
                                    setMotivo(e.target.value);
                                    if (errors.motivo) {
                                        setErrors(prev => ({ ...prev, motivo: undefined }));
                                    }
                                }}
                                error={errors.motivo}
                                required
                                disabled={isSubmitting}
                                placeholder="Ingrese el motivo detallado del cambio de estatus..."
                                rows={4}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {motivo.length}/500 caracteres
                            </p>
                        </div>

                        {/* Mensaje de error general */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer fijo */}
                <div className="flex-shrink-0 flex items-center justify-between border-t border-gray-200 px-8 py-4 bg-white rounded-b-[30px]">
                    <div className="flex items-center gap-1">
                        <span className="text-danger font-medium text-sm">*</span>
                        <span className="text-sm text-gray-600">Campo obligatorio</span>
                    </div>

                    {/* Botón de submit (MOVIDO AL FOOTER) */}
                    <Button
                        type="submit"
                        form="change-status-form"
                        variant="primary"
                        size="xl"
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        Confirmar Nuevo Estatus
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
