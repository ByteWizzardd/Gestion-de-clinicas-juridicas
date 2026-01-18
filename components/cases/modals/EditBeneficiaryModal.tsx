'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Modal from '../../ui/feedback/Modal';
import Input from '../../forms/Input';
import InputGroup from '../../forms/InputGroup';
import Select from '../../forms/Select';
import Button from '../../ui/Button';
import DatePicker from '../../forms/DatePicker';
import { X, Calendar, User, Search } from 'lucide-react';
import { updateBeneficiarioAction, searchBeneficiariosByCedulaAction } from '@/app/actions/beneficiarios';

interface EditBeneficiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    idCaso: number;
    beneficiario: {
        num_beneficiario: number;
        cedula: string | null;
        nombres: string;
        apellidos: string;
        fecha_nac: string;
        sexo: string;
        tipo_beneficiario: string;
        parentesco: string;
    } | null;
    beneficiariosActuales?: Array<{ cedula: string | null }>;
    onSuccess?: () => void;
}

interface FormData {
    cedulaTipo: string;
    cedulaNumero: string;
    nombres: string;
    apellidos: string;
    fechaNac: string;
    sexo: string;
    tipoBeneficiario: string;
    parentesco: string;
}

const INITIAL_FORM_DATA: FormData = {
    cedulaTipo: 'V',
    cedulaNumero: '',
    nombres: '',
    apellidos: '',
    fechaNac: '',
    sexo: '',
    tipoBeneficiario: 'Directo',
    parentesco: '',
};

export default function EditBeneficiaryModal({
    isOpen,
    onClose,
    idCaso,
    beneficiario,
    beneficiariosActuales = [],
    onSuccess,
}: EditBeneficiaryModalProps) {
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [lockedFields, setLockedFields] = useState<Set<keyof FormData>>(new Set());

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && beneficiario) {
            // Parsear cédula si existe
            let cedulaTipo = 'V';
            let cedulaNumero = '';

            if (beneficiario.cedula && beneficiario.cedula.includes('-')) {
                const parts = beneficiario.cedula.split('-');
                if (parts.length === 2) {
                    cedulaTipo = parts[0];
                    cedulaNumero = parts[1];
                }
            }

            // Asegurar fecha YYYY-MM-DD
            let fechaNac = '';
            if (beneficiario.fecha_nac) {
                // Si ya es string YYYY-MM-DD o ISO
                fechaNac = beneficiario.fecha_nac.split('T')[0];
            }

            setFormData({
                cedulaTipo,
                cedulaNumero,
                nombres: beneficiario.nombres,
                apellidos: beneficiario.apellidos,
                fechaNac: fechaNac,
                sexo: beneficiario.sexo,
                tipoBeneficiario: beneficiario.tipo_beneficiario,
                parentesco: beneficiario.parentesco,
            });

            setErrors({});
            setLockedFields(new Set());
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [isOpen, beneficiario]);

    // Cerrar sugerencias al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        // Validar duplicado en este caso por cédula, excluyendo el actual
        if (formData.cedulaNumero.trim()) {
            const fullCedula = `${formData.cedulaTipo}-${formData.cedulaNumero.trim()}`;
            // Si la cédula cambió, verificar si ya existe otro
            if (beneficiario?.cedula !== fullCedula) {
                const yaExiste = beneficiariosActuales.some(b => b.cedula === fullCedula);
                if (yaExiste) {
                    newErrors.cedulaNumero = 'Este beneficiario ya está registrado en este caso';
                }
            }
        }

        if (!formData.nombres.trim()) {
            newErrors.nombres = 'El nombre es requerido';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(formData.nombres.trim())) {
            newErrors.nombres = 'Solo se permiten letras y espacios';
        }

        if (!formData.apellidos.trim()) {
            newErrors.apellidos = 'El apellido es requerido';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(formData.apellidos.trim())) {
            newErrors.apellidos = 'Solo se permiten letras y espacios';
        }

        if (!formData.fechaNac) newErrors.fechaNac = 'La fecha de nacimiento es requerida';
        if (!formData.sexo) newErrors.sexo = 'El sexo es requerido';
        if (!formData.tipoBeneficiario) newErrors.tipoBeneficiario = 'El tipo es requerido';
        if (!formData.parentesco.trim()) newErrors.parentesco = 'El parentesco es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSearch = async (tipo: string, numero: string) => {
        if (!numero || numero.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const cedula = `${tipo}-${numero}`;

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const result = await searchBeneficiariosByCedulaAction(cedula);
                if (result.success && result.data) {
                    setSuggestions(result.data);
                    setShowSuggestions(result.data.length > 0);

                    // Si hay una coincidencia exacta, autocompletar automáticamente
                    const exactMatch = result.data.find(p => p.cedula === cedula);
                    if (exactMatch) {
                        autocompleteFromPerson(exactMatch);
                    }
                }
            } catch (error) {
                console.error('Error searching beneficiary:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    const autocompleteFromPerson = (persona: any) => {
        let fechaNacString = '';
        if (persona.fecha_nacimiento) {
            if (persona.fecha_nacimiento instanceof Date) {
                fechaNacString = persona.fecha_nacimiento.toISOString().split('T')[0];
            } else if (typeof persona.fecha_nacimiento === 'string') {
                fechaNacString = persona.fecha_nacimiento.split('T')[0];
            }
        }

        let cedulaTipo = formData.cedulaTipo;
        let cedulaNumero = formData.cedulaNumero;

        if (persona.cedula && persona.cedula.includes('-')) {
            const parts = persona.cedula.split('-');
            if (parts.length === 2) {
                cedulaTipo = parts[0];
                cedulaNumero = parts[1];
            }
        }

        setFormData((prev) => ({
            ...prev,
            cedulaTipo,
            cedulaNumero,
            nombres: persona.nombres || prev.nombres,
            apellidos: persona.apellidos || prev.apellidos,
            fechaNac: fechaNacString || prev.fechaNac,
            sexo: persona.sexo || prev.sexo,
        }));

        const newLocked = new Set<keyof FormData>();
        if (persona.nombres) newLocked.add('nombres');
        if (persona.apellidos) newLocked.add('apellidos');
        if (fechaNacString) newLocked.add('fechaNac');
        if (persona.sexo) newLocked.add('sexo');
        setLockedFields(newLocked);

        setShowSuggestions(false);
    };

    const updateField = (field: keyof FormData, value: string) => {
        if (lockedFields.has(field)) return;

        let filteredValue = value;
        if (field === 'nombres' || field === 'apellidos' || field === 'parentesco') {
            filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
        }

        setFormData((prev) => {
            const newData = { ...prev, [field]: filteredValue };

            if (field === 'cedulaTipo' || field === 'cedulaNumero') {
                if (lockedFields.size > 0) {
                    setLockedFields(new Set());
                }
                handleSearch(newData.cedulaTipo, newData.cedulaNumero);
            }

            return newData;
        });

        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        if (!validateForm() || !beneficiario) return;

        setIsSubmitting(true);
        try {
            const result = await updateBeneficiarioAction({
                id_caso: idCaso,
                num_beneficiario: beneficiario.num_beneficiario,
                cedula: formData.cedulaNumero ? `${formData.cedulaTipo}-${formData.cedulaNumero}` : null,
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                fecha_nac: formData.fechaNac,
                sexo: formData.sexo,
                tipo_beneficiario: formData.tipoBeneficiario,
                parentesco: formData.parentesco,
            });

            if (result.success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                alert(result.error?.message || 'Error al actualizar beneficiario');
            }
        } catch (error) {
            console.error('Error submitting beneficiary:', error);
            alert('Error inesperado al actualizar beneficiario');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!beneficiario) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="custom"
            className="rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] w-[95vw] sm:w-[90vw] lg:w-[85vw] max-w-[1100px] mx-auto"
            showCloseButton={false}
        >
            <div className="flex flex-col h-full bg-white rounded-[50px] overflow-hidden max-h-[90vh]">
                {/* Header fijo */}
                <div className="shrink-0 p-8 pb-4 relative border-b border-gray-200">
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
                        disabled={isSubmitting}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-normal text-foreground">Editar Beneficiario</h2>
                </div>

                {/* Área de contenido */}
                <div className="px-8 py-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                        {/* Cédula con autocompletado */}
                        <div className="col-span-1 relative" ref={containerRef}>
                            <InputGroup
                                label="Cédula"
                                selectValue={formData.cedulaTipo}
                                selectOptions={[
                                    { value: 'V', label: 'V' },
                                    { value: 'E', label: 'E' },
                                    { value: 'P', label: 'P' },
                                ]}
                                onSelectChange={(val) => updateField('cedulaTipo', val)}
                                inputValue={formData.cedulaNumero}
                                onInputChange={(val) => updateField('cedulaNumero', val)}
                                inputPlaceholder="Ingrese cédula (opcional)"
                                numbersOnly={formData.cedulaTipo !== 'P'}
                                error={errors.cedulaNumero}
                            />

                            <AnimatePresence>
                                {showSuggestions && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2"
                                    >
                                        {isSearching ? (
                                            <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
                                        ) : (
                                            suggestions.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => autocompleteFromPerson(item)}
                                                    className="w-full text-left px-4 py-3 hover:bg-primary/5 rounded-xl transition-colors flex items-center gap-3"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 text-sm">{item.cedula}</div>
                                                        <div className="text-xs text-gray-500">{item.nombre_completo}</div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="col-span-1">
                            <Input
                                label="Nombres *"
                                value={formData.nombres}
                                onChange={(e) => updateField('nombres', e.target.value)}
                                placeholder="Ingrese nombres"
                                error={errors.nombres}
                                disabled={lockedFields.has('nombres') || isSubmitting}
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <Input
                                label="Apellidos *"
                                value={formData.apellidos}
                                onChange={(e) => updateField('apellidos', e.target.value)}
                                placeholder="Ingrese apellidos"
                                error={errors.apellidos}
                                disabled={lockedFields.has('apellidos') || isSubmitting}
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-normal text-foreground mb-1">
                                    Fecha de Nacimiento <span className="text-danger">*</span>
                                </label>
                                <DatePicker
                                    value={formData.fechaNac}
                                    onChange={(val) => updateField('fechaNac', val)}
                                    error={errors.fechaNac}
                                    disabled={lockedFields.has('fechaNac') || isSubmitting}
                                    required
                                />
                                {errors.fechaNac && <p className="text-xs text-danger mt-1">{errors.fechaNac}</p>}
                            </div>
                        </div>

                        <div className="col-span-1">
                            <Select
                                label="Sexo *"
                                value={formData.sexo}
                                onChange={(e) => updateField('sexo', e.target.value)}
                                options={[
                                    { value: 'M', label: 'Masculino' },
                                    { value: 'F', label: 'Femenino' },
                                ]}
                                placeholder="Seleccionar sexo"
                                error={errors.sexo}
                                disabled={lockedFields.has('sexo') || isSubmitting}
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <Select
                                label="Tipo de Beneficiario *"
                                value={formData.tipoBeneficiario}
                                onChange={(e) => updateField('tipoBeneficiario', e.target.value)}
                                options={[
                                    { value: 'Directo', label: 'Directo' },
                                    { value: 'Indirecto', label: 'Indirecto' },
                                ]}
                                error={errors.tipoBeneficiario}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="col-span-3">
                            <Input
                                label="Parentesco con el Solicitante *"
                                value={formData.parentesco}
                                onChange={(e) => updateField('parentesco', e.target.value)}
                                placeholder="Ingrese el parentesco (ej: Hijo, Hija, Sobrino, etc.)"
                                error={errors.parentesco}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Footer fijo */}
                <div className="shrink-0 flex flex-col border-t border-gray-200 px-8 py-4 bg-white">
                    <div className="flex items-center gap-1 mb-4">
                        <span className="text-danger font-medium text-sm">*</span>
                        <span className="text-sm text-gray-600">Campo obligatorio</span>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            size="xl"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            size="xl"
                            onClick={handleSubmit}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
