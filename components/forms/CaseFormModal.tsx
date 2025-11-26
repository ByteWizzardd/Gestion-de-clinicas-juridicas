'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import DatePicker from '../ui/DatePicker';
import Button from '../ui/Button';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface FormData {
  fechaCaso: string;
  casoNumero: string; // Autogenerado, read-only
  cedulaSolicitante: string;
  tipoCaso: string;
  tramite: string;
  estatus: string;
  nucleo: string;
  cedulaProfesor: string;
  cedulaEstudiante: string;
  observaciones: string;
}

export default function CaseFormModal({
  isOpen,
  onClose,
  onSubmit,
}: CaseFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    fechaCaso: '',
    casoNumero: 'AUTO-001', // Valor de ejemplo, en producción sería autogenerado
    cedulaSolicitante: '',
    tipoCaso: '',
    tramite: '',
    estatus: '',
    nucleo: '',
    cedulaProfesor: '',
    cedulaEstudiante: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fechaCaso) {
      newErrors.fechaCaso = 'Este campo es requerido';
    }
    if (!formData.cedulaSolicitante.trim()) {
      newErrors.cedulaSolicitante = 'Este campo es requerido';
    }
    if (!formData.tipoCaso) {
      newErrors.tipoCaso = 'Este campo es requerido';
    }
    if (!formData.tramite) {
      newErrors.tramite = 'Este campo es requerido';
    }
    if (!formData.estatus) {
      newErrors.estatus = 'Este campo es requerido';
    }
    if (!formData.nucleo) {
      newErrors.nucleo = 'Este campo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      fechaCaso: '',
      casoNumero: 'AUTO-001',
      cedulaSolicitante: '',
      tipoCaso: '',
      tramite: '',
      estatus: '',
      nucleo: '',
      cedulaProfesor: '',
      cedulaEstudiante: '',
      observaciones: '',
    });
    setErrors({});
    onClose();
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="custom"
      className="rounded-[50px] max-w-[1200px] mx-auto"
      showCloseButton={false}
    >
      <div className="p-12 relative">
        {/* Botón de cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        {/* Título */}
        <h2 className="text-2xl font-normal text-foreground mb-6">Registro de Caso</h2>

        {/* Grid de formulario */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-6">
          {/* Fila 1: Fecha del Caso, Caso N°, Cédula de Solicitante */}
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">Fecha del Caso</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
                <DatePicker
                  value={formData.fechaCaso}
                  onChange={(value) => updateField('fechaCaso', value)}
                  error={errors.fechaCaso}
                  required
                />
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <Input
              label="Caso N°"
              value={formData.casoNumero}
              readOnly
              disabled
              placeholder="Autogenerado"
            />
          </div>
          <div className="col-span-1">
            <Input
              label="Cédula de Solicitante"
              value={formData.cedulaSolicitante}
              onChange={(e) => updateField('cedulaSolicitante', e.target.value)}
              placeholder="Ingrese cédula de solicitante"
              error={errors.cedulaSolicitante}
              required
            />
          </div>

          {/* Fila 2: Tipo de Caso, Trámite */}
          <div className="col-span-1">
            <Select
              label="Tipo de Caso"
              value={formData.tipoCaso}
              onChange={(e) => updateField('tipoCaso', e.target.value)}
              options={[
                { value: 'civil', label: 'Civil' },
                { value: 'penal', label: 'Penal' },
                { value: 'laboral', label: 'Laboral' },
                { value: 'familia', label: 'Familia' },
                { value: 'administrativo', label: 'Administrativo' },
              ]}
              placeholder="Seleccionar tipo de caso"
              error={errors.tipoCaso}
              required
            />
          </div>
          <div className="col-span-1">
            <Select
              label="Trámite"
              value={formData.tramite}
              onChange={(e) => updateField('tramite', e.target.value)}
              options={[
                { value: 'consulta', label: 'Consulta' },
                { value: 'asistencia', label: 'Asistencia Legal' },
                { value: 'seguimiento', label: 'Seguimiento' },
                { value: 'cierre', label: 'Cierre' },
              ]}
              placeholder="Seleccionar trámite"
              error={errors.tramite}
              required
            />
          </div>

          {/* Fila 3: Estatus, Núcleo, Cédula de Profesor */}
          <div className="col-span-1">
            <Select
              label="Estatus"
              value={formData.estatus}
              onChange={(e) => updateField('estatus', e.target.value)}
              options={[
                { value: 'abierto', label: 'Abierto' },
                { value: 'en_proceso', label: 'En Proceso' },
                { value: 'cerrado', label: 'Cerrado' },
                { value: 'archivado', label: 'Archivado' },
              ]}
              placeholder="Seleccionar estatus"
              error={errors.estatus}
              required
            />
          </div>
          <div className="col-span-1">
            <Select
              label="Núcleo"
              value={formData.nucleo}
              onChange={(e) => updateField('nucleo', e.target.value)}
              options={[
                { value: 'nucleo1', label: 'Núcleo 1' },
                { value: 'nucleo2', label: 'Núcleo 2' },
                { value: 'nucleo3', label: 'Núcleo 3' },
              ]}
              placeholder="Seleccionar núcleo"
              error={errors.nucleo}
              required
            />
          </div>
          <div className="col-span-1">
            <Input
              label="Cédula de Profesor"
              value={formData.cedulaProfesor}
              onChange={(e) => updateField('cedulaProfesor', e.target.value)}
              placeholder="Ingrese cédula de profesor"
            />
          </div>

          {/* Fila 4: Cédula de Estudiante */}
          <div className="col-span-1">
            <Input
              label="Cédula de Estudiante"
              value={formData.cedulaEstudiante}
              onChange={(e) => updateField('cedulaEstudiante', e.target.value)}
              placeholder="Ingrese cédula de estudiante"
            />
          </div>

          {/* Fila 5: Observaciones (ocupa todo el ancho) */}
          <div className="col-span-3">
            <TextArea
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) => updateField('observaciones', e.target.value)}
              placeholder="Ingrese observaciones del caso"
            />
          </div>
        </div>

        {/* Footer con botón */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button variant="primary" size="xl" onClick={handleSubmit}>
            Registrar Caso
          </Button>
        </div>
      </div>
    </Modal>
  );
}

