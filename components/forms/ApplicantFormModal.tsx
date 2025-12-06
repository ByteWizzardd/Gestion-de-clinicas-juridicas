'use client';

import { useState } from 'react';
import Modal from '../ui/feedback/Modal';
import Stepper from './Stepper';
import Input from './Input';
import InputGroup from './InputGroup';
import Select from './Select';
import Button from '../ui/Button';
import { ArrowRight, ArrowLeft, Calendar } from 'lucide-react';
import DatePicker from './DatePicker';

interface ApplicantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => void;
}

interface FormData {
  // Paso 1 - Identificación
  nombresApellidos: string;
  cedulaTipo: string;
  cedulaNumero: string;
  fechaNacimiento: string;
  sexo: string;
  telefonoLocal: string;
  telefonoCelular: string;
  correoElectronico: string;
  comunidadResidencia: string;
  parroquiaResidencia: string;
  estadoCivil: string;
  trabaja: string;
  // Paso 2 - Vivienda (se agregará después)
  // Paso 3 - Familia (se agregará después)
}

const STEPS = ['Identificación', 'Vivienda y Servicios Conexos', 'Familia y Hogar'];

export default function ApplicantFormModal({
  isOpen,
  onClose,
  onSubmit,
}: ApplicantFormModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    nombresApellidos: '',
    cedulaTipo: 'V',
    cedulaNumero: '',
    fechaNacimiento: '',
    sexo: '',
    telefonoLocal: '',
    telefonoCelular: '',
    correoElectronico: '',
    comunidadResidencia: '',
    parroquiaResidencia: '',
    estadoCivil: '',
    trabaja: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.nombresApellidos.trim()) {
      newErrors.nombresApellidos = 'Este campo es requerido';
    }
    if (!formData.cedulaNumero.trim()) {
      newErrors.cedulaNumero = 'Este campo es requerido';
    }
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'Este campo es requerido';
    }
    if (!formData.sexo) {
      newErrors.sexo = 'Este campo es requerido';
    }
    if (!formData.telefonoCelular.trim()) {
      newErrors.telefonoCelular = 'Este campo es requerido';
    }
    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = 'Este campo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = 'Correo electrónico inválido';
    }
    if (!formData.comunidadResidencia.trim()) {
      newErrors.comunidadResidencia = 'Este campo es requerido';
    }
    if (!formData.estadoCivil) {
      newErrors.estadoCivil = 'Este campo es requerido';
    }
    if (!formData.trabaja) {
      newErrors.trabaja = 'Este campo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateStep1()) {
        return;
      }
    }
    // Validaciones para otros pasos se agregarán después
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (currentStep === STEPS.length - 1) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({
      nombresApellidos: '',
      cedulaTipo: 'V',
      cedulaNumero: '',
      fechaNacimiento: '',
      sexo: '',
      telefonoLocal: '',
      telefonoCelular: '',
      correoElectronico: '',
      comunidadResidencia: '',
      parroquiaResidencia: '',
      estadoCivil: '',
      trabaja: '',
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

  const renderStep1 = () => (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      {/* Fila 1: Nombres y Apellidos (ocupa más espacio), Fecha de Nacimiento, Sexo */}
      <div className="col-span-1">
        <Input
          label="Nombres y Apellidos"
          value={formData.nombresApellidos}
          onChange={(e) => updateField('nombresApellidos', e.target.value)}
          placeholder="Ingrese nombre completo"
          error={errors.nombresApellidos}
          required
        />
      </div>
      <div className="col-span-1">
        <div className="flex flex-col gap-1">
          <label className="text-base font-normal text-foreground mb-1">Fecha de Nacimiento</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
            <DatePicker
              value={formData.fechaNacimiento}
              onChange={(value) => updateField('fechaNacimiento', value)}
              error={errors.fechaNacimiento}
              required
            />
          </div>
        </div>
      </div>
      <div className="col-span-1">
        <Select
          label="Sexo"
          value={formData.sexo}
          onChange={(e) => updateField('sexo', e.target.value)}
          options={[
            { value: 'M', label: 'Masculino' },
            { value: 'F', label: 'Femenino' },
            { value: 'O', label: 'Otro' },
          ]}
          placeholder="Seleccionar sexo"
          error={errors.sexo}
          required
        />
      </div>

      {/* Fila 2: Cédula, Teléfono Local, Teléfono Celular */}
      <div className="col-span-1">
        <InputGroup
          label="Cédula"
          selectValue={formData.cedulaTipo}
          selectOptions={[
            { value: 'V', label: 'V' },
            { value: 'E', label: 'E' },
            { value: 'J', label: 'J' },
          ]}
          onSelectChange={(value) => updateField('cedulaTipo', value)}
          inputValue={formData.cedulaNumero}
          onInputChange={(value) => updateField('cedulaNumero', value)}
          inputPlaceholder="Ingrese cédula"
          error={errors.cedulaNumero}
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Teléfono Local"
          value={formData.telefonoLocal}
          onChange={(e) => updateField('telefonoLocal', e.target.value)}
          placeholder="Ingrese teléfono local"
          type="tel"
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Teléfono Celular"
          value={formData.telefonoCelular}
          onChange={(e) => updateField('telefonoCelular', e.target.value)}
          placeholder="Ingrese teléfono celular"
          type="tel"
          error={errors.telefonoCelular}
          required
        />
      </div>

      {/* Fila 3: Correo Electrónico, Comunidad de Residencia, Parroquia de Residencia */}
      <div className="col-span-1">
        <Input
          label="Correo Electrónico"
          type="email"
          value={formData.correoElectronico}
          onChange={(e) => updateField('correoElectronico', e.target.value)}
          placeholder="Ingrese correo electrónico"
          error={errors.correoElectronico}
          required
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Comunidad de Residencia"
          value={formData.comunidadResidencia}
          onChange={(e) => updateField('comunidadResidencia', e.target.value)}
          placeholder="Ingrese comunidad de residencia"
          error={errors.comunidadResidencia}
          required
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Parroquia de Residencia"
          value={formData.parroquiaResidencia}
          onChange={(e) => updateField('parroquiaResidencia', e.target.value)}
          placeholder="Ingrese parroquia de residencia"
        />
      </div>

      {/* Fila 4: Estado Civil, ¿Trabaja? */}
      <div className="col-span-1">
        <Select
          label="Estado Civil"
          value={formData.estadoCivil}
          onChange={(e) => updateField('estadoCivil', e.target.value)}
          options={[
            { value: 'soltero', label: 'Soltero/a' },
            { value: 'casado', label: 'Casado/a' },
            { value: 'divorciado', label: 'Divorciado/a' },
            { value: 'viudo', label: 'Viudo/a' },
            { value: 'union_libre', label: 'Unión Libre' },
          ]}
          placeholder="Seleccionar estado civil"
          error={errors.estadoCivil}
          required
        />
      </div>
      <div className="col-span-1">
        <Select
          label="¿Trabaja?"
          value={formData.trabaja}
          onChange={(e) => updateField('trabaja', e.target.value)}
          options={[
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' },
          ]}
          placeholder="Seleccionar opción"
          error={errors.trabaja}
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <p className="text-gray-600">Contenido del paso 2 - Vivienda y Servicios Conexos</p>
      {/* Se completará con los campos específicos del paso 2 */}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <p className="text-gray-600">Contenido del paso 3 - Familia y Hogar</p>
      {/* Se completará con los campos específicos del paso 3 */}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      default:
        return null;
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Título */}
        <h2 className="text-2xl font-normal text-foreground mb-6">Registro de Solicitante</h2>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={currentStep} />

        {/* Contenido del paso */}
        <div className="min-h-[300px] mb-4">{renderStepContent()}</div>

        {/* Footer con botones */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Atrás
            </Button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button variant="primary" size="xl" onClick={handleNext}>
              Siguiente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button variant="primary" size="xl" onClick={handleSubmit}>
              Registrar
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

