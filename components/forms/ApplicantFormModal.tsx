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
  cedulaTipo: string;
  cedulaNumero: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: string;
  telefonoLocal: string;
  codigoPaisCelular: string; // Código de país para teléfono celular
  telefonoCelular: string;
  correoElectronico: string;
  estadoCivil: string;
  concubinato: string;
  // Paso 2 - Vivienda
  tipoVivienda: string;
  cantHabitaciones: string;
  cantBanos: string;
  materialPiso: string;
  materialParedes: string;
  materialTecho: string;
  aguaPotable: string;
  eliminacionAguasN: string;
  aseo: string;
  artefactos: string[]; // Array de artefactos seleccionados
  // Paso 3 - Familia y Hogar
  cantPersonas: string;
  cantTrabajadores: string;
  cantNinos: string;
  cantNinosEstudiando: string;
  jefeHogar: string;
  tipoEducativo: string; // Tipo de educación del jefe de hogar
  numeroEducativo: string; // Número/grado específico del jefe de hogar
  nivelEducativo: string; // Se mantiene para compatibilidad, se calculará desde tipo y número
  anosCursados: string;
  semestresCursados: string;
  trimestresCursados: string;
  ingresosMensuales: string;
  // Paso 4 - Nivel Educativo del Solicitante
  tipoEducativoSolicitante: string; // Tipo de educación del solicitante
  numeroEducativoSolicitante: string; // Número/grado específico del solicitante
  nivelEducativoSolicitante: string; // Se mantiene para compatibilidad, se calculará desde tipo y número
  anosCursadosSolicitante: string;
  semestresCursadosSolicitante: string;
  trimestresCursadosSolicitante: string;
  // Paso 5 - Trabajo
  trabaja: string; // ¿Trabaja? (si/no)
  condicionTrabajo: string; // Condición en el trabajo (si trabaja)
  buscandoTrabajo: string; // ¿Está buscando trabajo? (si no trabaja)
  condicionActividad: string; // Condición de actividad (si no trabaja y no busca trabajo)
}

const STEPS = [
  'Identificación', 
  'Nivel Educativo',
  'Trabajo',
  'Vivienda y Servicios Conexos', 
  'Familia y Hogar'
];

// Códigos de país para teléfono celular
const CODIGOS_PAIS = [
  { value: '+58', label: '+58' }, // Venezuela
  { value: '+1', label: '+1' }, // Estados Unidos/Canadá
  { value: '+52', label: '+52' }, // México
  { value: '+57', label: '+57' }, // Colombia
  { value: '+51', label: '+51' }, // Perú
  { value: '+56', label: '+56' }, // Chile
  { value: '+54', label: '+54' }, // Argentina
  { value: '+55', label: '+55' }, // Brasil
  { value: '+593', label: '+593' }, // Ecuador
  { value: '+595', label: '+595' }, // Paraguay
  { value: '+598', label: '+598' }, // Uruguay
  { value: '+591', label: '+591' }, // Bolivia
  { value: '+34', label: '+34' }, // España
];

// Tipos de educación
const TIPOS_EDUCACION = [
  { value: 'sin_nivel', label: 'Sin Nivel' },
  { value: 'primaria', label: 'Primaria (grado)' },
  { value: 'basica', label: 'Básica (1er-3er año/7mo-9no grado)' },
  { value: 'media', label: 'Media Diversificada (4to-5to año)' },
  { value: 'tecnico_medio', label: 'Técnico Medio' },
  { value: 'tecnico_superior', label: 'Técnico Superior' },
  { value: 'universitaria', label: 'Universitaria' },
];

// Función para obtener los números/grados según el tipo de educación
const getNumerosPorTipo = (tipo: string) => {
  switch (tipo) {
    case 'sin_nivel':
      return [{ value: '0', label: '0' }];
    case 'primaria':
      return [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
      ];
    case 'basica':
      return [
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
      ];
    case 'media':
      return [
        { value: '10', label: '10' },
        { value: '11', label: '11' },
      ];
    case 'tecnico_medio':
      return [{ value: '12', label: '12' }];
    case 'tecnico_superior':
      return [{ value: '13', label: '13' }];
    case 'universitaria':
      return [{ value: '14', label: '14' }];
    default:
      return [];
  }
};

export default function ApplicantFormModal({
  isOpen,
  onClose,
  onSubmit,
}: ApplicantFormModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    cedulaTipo: 'V',
    cedulaNumero: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    sexo: '',
    telefonoLocal: '',
    codigoPaisCelular: '+58', // Código por defecto: Venezuela
    telefonoCelular: '',
    correoElectronico: '',
    estadoCivil: '',
    concubinato: '',
    tipoVivienda: '',
    cantHabitaciones: '',
    cantBanos: '',
    materialPiso: '',
    materialParedes: '',
    materialTecho: '',
    aguaPotable: '',
    eliminacionAguasN: '',
    aseo: '',
    artefactos: [],
    cantPersonas: '',
    cantTrabajadores: '',
    cantNinos: '',
    cantNinosEstudiando: '',
    jefeHogar: '',
    tipoEducativo: '',
    numeroEducativo: '',
    nivelEducativo: '',
    anosCursados: '',
    semestresCursados: '',
    trimestresCursados: '',
    ingresosMensuales: '',
    tipoEducativoSolicitante: '',
    numeroEducativoSolicitante: '',
    nivelEducativoSolicitante: '',
    anosCursadosSolicitante: '',
    semestresCursadosSolicitante: '',
    trimestresCursadosSolicitante: '',
    trabaja: '',
    condicionTrabajo: '',
    buscandoTrabajo: '',
    condicionActividad: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [cedulaCheckTimeout, setCedulaCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Validar cédula
    if (!formData.cedulaNumero.trim()) {
      newErrors.cedulaNumero = 'Este campo es requerido';
    }
    
    // Validar nombres
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Este campo es requerido';
    }
    
    // Validar apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Este campo es requerido';
    }
    
    // Validar fecha de nacimiento
    if (!formData.fechaNacimiento || formData.fechaNacimiento.trim() === '') {
      newErrors.fechaNacimiento = 'Este campo es requerido';
    }
    
    // Validar sexo
    if (!formData.sexo || formData.sexo.trim() === '') {
      newErrors.sexo = 'Este campo es requerido';
    }
    
    // Validar teléfono celular
    if (!formData.telefonoCelular.trim()) {
      newErrors.telefonoCelular = 'Este campo es requerido';
    }
    
    // Validar correo electrónico
    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = 'Este campo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = 'Correo electrónico inválido';
    }
    
    // Validar estado civil
    if (!formData.estadoCivil || formData.estadoCivil.trim() === '') {
      newErrors.estadoCivil = 'Este campo es requerido';
    }
    
    // Validar concubinato
    if (!formData.concubinato || formData.concubinato.trim() === '') {
      newErrors.concubinato = 'Este campo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.tipoVivienda || formData.tipoVivienda.trim() === '') {
      newErrors.tipoVivienda = 'Este campo es requerido';
    }
    if (!formData.cantHabitaciones.trim()) {
      newErrors.cantHabitaciones = 'Este campo es requerido';
    } else if (isNaN(Number(formData.cantHabitaciones)) || Number(formData.cantHabitaciones) < 0) {
      newErrors.cantHabitaciones = 'Debe ser un número válido';
    }
    if (!formData.cantBanos.trim()) {
      newErrors.cantBanos = 'Este campo es requerido';
    } else if (isNaN(Number(formData.cantBanos)) || Number(formData.cantBanos) < 0) {
      newErrors.cantBanos = 'Debe ser un número válido';
    }
    if (!formData.materialPiso || formData.materialPiso.trim() === '') {
      newErrors.materialPiso = 'Este campo es requerido';
    }
    if (!formData.materialParedes || formData.materialParedes.trim() === '') {
      newErrors.materialParedes = 'Este campo es requerido';
    }
    if (!formData.materialTecho || formData.materialTecho.trim() === '') {
      newErrors.materialTecho = 'Este campo es requerido';
    }
    if (!formData.aguaPotable || formData.aguaPotable.trim() === '') {
      newErrors.aguaPotable = 'Este campo es requerido';
    }
    if (!formData.eliminacionAguasN || formData.eliminacionAguasN.trim() === '') {
      newErrors.eliminacionAguasN = 'Este campo es requerido';
    }
    if (!formData.aseo || formData.aseo.trim() === '') {
      newErrors.aseo = 'Este campo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    let cantPersonasValue = 0;
    let cantTrabajadoresValue = 0;
    let cantNinosValue = 0;
    let cantNinosEstudiandoValue = 0;

    // Validar cantidad de personas
    if (!formData.cantPersonas || formData.cantPersonas.trim() === '') {
      newErrors.cantPersonas = 'Este campo es requerido';
    } else {
      cantPersonasValue = Number(formData.cantPersonas);
      if (isNaN(cantPersonasValue) || cantPersonasValue < 0) {
        newErrors.cantPersonas = 'Debe ser un número válido';
      } else if (cantPersonasValue === 0) {
        newErrors.cantPersonas = 'Debe haber al menos una persona';
      }
    }

    // Validar cantidad de trabajadores
    if (!formData.cantTrabajadores || formData.cantTrabajadores.trim() === '') {
      newErrors.cantTrabajadores = 'Este campo es requerido';
    } else {
      cantTrabajadoresValue = Number(formData.cantTrabajadores);
      if (isNaN(cantTrabajadoresValue) || cantTrabajadoresValue < 0) {
        newErrors.cantTrabajadores = 'Debe ser un número válido';
      } else if (!newErrors.cantPersonas && cantTrabajadoresValue > cantPersonasValue) {
        newErrors.cantTrabajadores = `No puede ser mayor que la cantidad de personas (${cantPersonasValue})`;
      }
    }

    // Validar cantidad de niños
    if (!formData.cantNinos || formData.cantNinos.trim() === '') {
      newErrors.cantNinos = 'Este campo es requerido';
    } else {
      cantNinosValue = Number(formData.cantNinos);
      if (isNaN(cantNinosValue) || cantNinosValue < 0) {
        newErrors.cantNinos = 'Debe ser un número válido';
      } else if (!newErrors.cantPersonas && cantNinosValue > cantPersonasValue) {
        newErrors.cantNinos = `No puede ser mayor que la cantidad de personas (${cantPersonasValue})`;
      }
    }

    // Validar cantidad de niños estudiando
    if (!formData.cantNinosEstudiando || formData.cantNinosEstudiando.trim() === '') {
      newErrors.cantNinosEstudiando = 'Este campo es requerido';
    } else {
      cantNinosEstudiandoValue = Number(formData.cantNinosEstudiando);
      if (isNaN(cantNinosEstudiandoValue) || cantNinosEstudiandoValue < 0) {
        newErrors.cantNinosEstudiando = 'Debe ser un número válido';
      } else {
        // No puede ser mayor que la cantidad de niños
        if (!newErrors.cantNinos && cantNinosEstudiandoValue > cantNinosValue) {
          newErrors.cantNinosEstudiando = `No puede ser mayor que la cantidad de niños (${cantNinosValue})`;
        }
      }
    }

    // Validar jefe de hogar
    if (!formData.jefeHogar || formData.jefeHogar.trim() === '') {
      newErrors.jefeHogar = 'Este campo es requerido';
    }

    // Validar ingresos mensuales
    if (!formData.ingresosMensuales || formData.ingresosMensuales.trim() === '') {
      newErrors.ingresosMensuales = 'Este campo es requerido';
    } else {
      const numValue = Number(formData.ingresosMensuales);
      if (isNaN(numValue) || numValue < 0) {
        newErrors.ingresosMensuales = 'Debe ser un número válido mayor o igual a 0';
      }
    }

    // Solo validar nivel educativo si NO es jefe de hogar
    if (formData.jefeHogar === 'no') {
      if (!formData.tipoEducativo || formData.tipoEducativo.trim() === '') {
        newErrors.tipoEducativo = 'Este campo es requerido';
      }
      if (!formData.numeroEducativo || formData.numeroEducativo.trim() === '') {
        newErrors.numeroEducativo = 'Este campo es requerido';
      }
      // Solo validar años/semestres/trimestres si el nivel es 12, 13 o 14
      const nivelNum = Number(formData.numeroEducativo);
      if (nivelNum === 12 || nivelNum === 13 || nivelNum === 14) {
        let anosValue = 0;
        let semestresValue = 0;
        let trimestresValue = 0;
        
        if (!formData.anosCursados || formData.anosCursados.trim() === '') {
          newErrors.anosCursados = 'Este campo es requerido';
        } else {
          anosValue = Number(formData.anosCursados);
          if (isNaN(anosValue) || anosValue < 0) {
            newErrors.anosCursados = 'Debe ser un número válido';
          }
        }
        if (!formData.semestresCursados || formData.semestresCursados.trim() === '') {
          newErrors.semestresCursados = 'Este campo es requerido';
        } else {
          semestresValue = Number(formData.semestresCursados);
          if (isNaN(semestresValue) || semestresValue < 0) {
            newErrors.semestresCursados = 'Debe ser un número válido';
          } else if (!newErrors.anosCursados && semestresValue > anosValue * 2) {
            // 1 año = 2 semestres, los semestres no pueden ser más de 2 veces los años
            newErrors.semestresCursados = `Los semestres no pueden ser más de ${anosValue * 2} (2 semestres por año)`;
          }
        }
        if (!formData.trimestresCursados || formData.trimestresCursados.trim() === '') {
          newErrors.trimestresCursados = 'Este campo es requerido';
        } else {
          trimestresValue = Number(formData.trimestresCursados);
          if (isNaN(trimestresValue) || trimestresValue < 0) {
            newErrors.trimestresCursados = 'Debe ser un número válido';
          } else {
            // Validar congruencia con años (1 año = 4 trimestres)
            if (!newErrors.anosCursados && trimestresValue > anosValue * 4) {
              newErrors.trimestresCursados = `Los trimestres no pueden ser más de ${anosValue * 4} (4 trimestres por año)`;
            }
            // Validar congruencia con semestres (1 semestre = 2 trimestres)
            if (!newErrors.semestresCursados && trimestresValue > semestresValue * 2) {
              newErrors.trimestresCursados = `Los trimestres no pueden ser más de ${semestresValue * 2} (2 trimestres por semestre)`;
            }
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.tipoEducativoSolicitante || formData.tipoEducativoSolicitante.trim() === '') {
      newErrors.tipoEducativoSolicitante = 'Este campo es requerido';
    }
    if (!formData.numeroEducativoSolicitante || formData.numeroEducativoSolicitante.trim() === '') {
      newErrors.numeroEducativoSolicitante = 'Este campo es requerido';
    }
    // Solo validar años/semestres/trimestres si el nivel es 12, 13 o 14
    const nivelNum = Number(formData.numeroEducativoSolicitante);
    if (nivelNum === 12 || nivelNum === 13 || nivelNum === 14) {
      let anosValue = 0;
      let semestresValue = 0;
      let trimestresValue = 0;
      
      if (!formData.anosCursadosSolicitante || formData.anosCursadosSolicitante.trim() === '') {
        newErrors.anosCursadosSolicitante = 'Este campo es requerido';
      } else {
        anosValue = Number(formData.anosCursadosSolicitante);
        if (isNaN(anosValue) || anosValue < 0) {
          newErrors.anosCursadosSolicitante = 'Debe ser un número válido';
        }
      }
      if (!formData.semestresCursadosSolicitante || formData.semestresCursadosSolicitante.trim() === '') {
        newErrors.semestresCursadosSolicitante = 'Este campo es requerido';
      } else {
        semestresValue = Number(formData.semestresCursadosSolicitante);
        if (isNaN(semestresValue) || semestresValue < 0) {
          newErrors.semestresCursadosSolicitante = 'Debe ser un número válido';
        } else if (!newErrors.anosCursadosSolicitante && semestresValue > anosValue * 2) {
          // 1 año = 2 semestres, los semestres no pueden ser más de 2 veces los años
          newErrors.semestresCursadosSolicitante = `Los semestres no pueden ser más de ${anosValue * 2} (2 semestres por año)`;
        }
      }
      if (!formData.trimestresCursadosSolicitante || formData.trimestresCursadosSolicitante.trim() === '') {
        newErrors.trimestresCursadosSolicitante = 'Este campo es requerido';
      } else {
        trimestresValue = Number(formData.trimestresCursadosSolicitante);
        if (isNaN(trimestresValue) || trimestresValue < 0) {
          newErrors.trimestresCursadosSolicitante = 'Debe ser un número válido';
        } else {
          // Validar congruencia con años (1 año = 4 trimestres)
          if (!newErrors.anosCursadosSolicitante && trimestresValue > anosValue * 4) {
            newErrors.trimestresCursadosSolicitante = `Los trimestres no pueden ser más de ${anosValue * 4} (4 trimestres por año)`;
          }
          // Validar congruencia con semestres (1 semestre = 2 trimestres)
          if (!newErrors.semestresCursadosSolicitante && trimestresValue > semestresValue * 2) {
            newErrors.trimestresCursadosSolicitante = `Los trimestres no pueden ser más de ${semestresValue * 2} (2 trimestres por semestre)`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Validar si trabaja
    if (!formData.trabaja || formData.trabaja.trim() === '') {
      newErrors.trabaja = 'Este campo es requerido';
    }

    // Si trabaja, validar condición de trabajo
    if (formData.trabaja === 'si') {
      if (!formData.condicionTrabajo || formData.condicionTrabajo.trim() === '') {
        newErrors.condicionTrabajo = 'Este campo es requerido';
      }
    }

    // Si no trabaja, validar si está buscando trabajo
    if (formData.trabaja === 'no') {
      if (!formData.buscandoTrabajo || formData.buscandoTrabajo.trim() === '') {
        newErrors.buscandoTrabajo = 'Este campo es requerido';
      }
      
      // Si no está buscando trabajo, validar condición de actividad
      if (formData.buscandoTrabajo === 'no') {
        if (!formData.condicionActividad || formData.condicionActividad.trim() === '') {
          newErrors.condicionActividad = 'Este campo es requerido';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // Validar paso 1 antes de avanzar
    // Paso 0: Identificación
    if (currentStep === 0) {
      const isValid = validateStep1();
      if (!isValid) {
        // No avanzar si hay errores de validación
        return;
      }
    }
    // Paso 1: Nivel Educativo del Solicitante
    if (currentStep === 1) {
      const isValid = validateStep4();
      if (!isValid) {
        // No avanzar si hay errores de validación
        return;
      }
    }
    // Paso 2: Trabajo
    if (currentStep === 2) {
      const isValid = validateStep5();
      if (!isValid) {
        // No avanzar si hay errores de validación
        return;
      }
    }
    // Paso 3: Vivienda
    if (currentStep === 3) {
      const isValid = validateStep2();
      if (!isValid) {
        // No avanzar si hay errores de validación
        return;
      }
    }
    // Paso 4: Familia y Hogar
    if (currentStep === 4) {
      const isValid = validateStep3();
      if (!isValid) {
        // No avanzar si hay errores de validación
        return;
      }
    }
    
    // Solo avanzar si no hay errores
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (currentStep === STEPS.length - 1) {
      // Validar el paso 4 (Familia y Hogar) antes de enviar
      const isValid = validateStep3();
      if (!isValid) {
        // No enviar si hay errores de validación
        return;
      }

      try {
        const response = await fetch('/api/solicitantes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMessage = result.error?.message || result.error || 'Error al registrar solicitante';
          throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        }

        // Llamar al callback de éxito
        onSubmit(result);
        handleClose();
      } catch (error: any) {
        console.error('Error al registrar solicitante:', error);
        const errorMessage = error?.message || 'Error al registrar solicitante. Por favor, intente nuevamente.';
        alert(errorMessage);
      }
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({
      cedulaTipo: 'V',
      cedulaNumero: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      sexo: '',
      telefonoLocal: '',
      codigoPaisCelular: '+58',
      telefonoCelular: '',
      correoElectronico: '',
      estadoCivil: '',
      concubinato: '',
      tipoVivienda: '',
      cantHabitaciones: '',
      cantBanos: '',
      materialPiso: '',
      materialParedes: '',
      materialTecho: '',
      aguaPotable: '',
      eliminacionAguasN: '',
      aseo: '',
      artefactos: [],
      cantPersonas: '',
      cantTrabajadores: '',
      cantNinos: '',
      cantNinosEstudiando: '',
      jefeHogar: '',
      tipoEducativo: '',
      numeroEducativo: '',
      nivelEducativo: '',
      anosCursados: '',
      semestresCursados: '',
      trimestresCursados: '',
      ingresosMensuales: '',
      tipoEducativoSolicitante: '',
      numeroEducativoSolicitante: '',
      nivelEducativoSolicitante: '',
      anosCursadosSolicitante: '',
      semestresCursadosSolicitante: '',
      trimestresCursadosSolicitante: '',
      trabaja: '',
      condicionTrabajo: '',
      buscandoTrabajo: '',
      condicionActividad: '',
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

  // Función para verificar si la cédula ya existe
  const checkCedulaExists = async (cedulaTipo: string, cedulaNumero: string) => {
    if (!cedulaNumero || cedulaNumero.trim() === '') {
      return;
    }

    const cedula = `${cedulaTipo}${cedulaNumero}`;
    
    try {
      const response = await fetch(`/api/clientes/search?q=${encodeURIComponent(cedula)}`);
      const result = await response.json();

      if (result.success && result.data) {
        // Buscar si hay una coincidencia exacta
        const clienteExistente = result.data.find((c: any) => c.cedula === cedula);
        
        if (clienteExistente) {
          setErrors((prev) => ({
            ...prev,
            cedulaNumero: `La cédula ${cedula} ya está registrada`,
          }));
        } else {
          // Limpiar el error si la cédula no existe
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.cedulaNumero;
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.error('Error al verificar cédula:', error);
      // No mostrar error al usuario si falla la verificación
    }
  };

  const handleArtefactoChange = (artefacto: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, artefactos: [...prev.artefactos, artefacto] };
      } else {
        return { ...prev, artefactos: prev.artefactos.filter((a) => a !== artefacto) };
      }
    });
  };

  const renderStep1 = () => (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      {/* Fila 1: Cédula, Nombres, Apellidos */}
      <div className="col-span-1">
        <InputGroup
          label="Cédula *"
          selectValue={formData.cedulaTipo}
          selectOptions={[
            { value: 'V', label: 'V' },
            { value: 'E', label: 'E' },
            { value: 'J', label: 'J' },
          ]}
          onSelectChange={(value) => {
            updateField('cedulaTipo', value);
            // Verificar cédula cuando cambia el tipo
            if (formData.cedulaNumero) {
              checkCedulaExists(value, formData.cedulaNumero);
            }
          }}
          inputValue={formData.cedulaNumero}
          onInputChange={(value) => {
            updateField('cedulaNumero', value);
            // Verificar cédula cuando se ingresa el número (con debounce)
            if (value && formData.cedulaTipo) {
              // Limpiar timeout anterior si existe
              if (cedulaCheckTimeout) {
                clearTimeout(cedulaCheckTimeout);
              }
              // Crear nuevo timeout para debounce
              const timeoutId = setTimeout(() => {
                checkCedulaExists(formData.cedulaTipo, value);
                setCedulaCheckTimeout(null);
              }, 500);
              setCedulaCheckTimeout(timeoutId);
            } else {
              // Limpiar error si el campo está vacío
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.cedulaNumero;
                return newErrors;
              });
            }
          }}
          inputPlaceholder="Ingrese cédula"
          error={errors.cedulaNumero}
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Nombres *"
          value={formData.nombres}
          onChange={(e) => updateField('nombres', e.target.value)}
          placeholder="Ingrese nombres"
          error={errors.nombres}
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
          required
        />
      </div>

      {/* Fila 2: Fecha de Nacimiento, Sexo, Teléfono Local */}
      <div className="col-span-1">
        <div className="flex flex-col gap-1">
          <label className="text-base font-normal text-foreground mb-1">Fecha de Nacimiento <span className="text-danger">*</span></label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
            <DatePicker
              value={formData.fechaNacimiento}
              onChange={(value) => updateField('fechaNacimiento', value)}
              error={errors.fechaNacimiento}
              required
            />
          </div>
          {errors.fechaNacimiento && <p className="text-xs text-danger mt-1">{errors.fechaNacimiento}</p>}
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
          required
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

      {/* Fila 3: Teléfono Celular, Correo Electrónico, Estado Civil */}
      <div className="col-span-1">
        <InputGroup
          label="Teléfono Celular *"
          selectValue={formData.codigoPaisCelular}
          selectOptions={CODIGOS_PAIS}
          onSelectChange={(value) => updateField('codigoPaisCelular', value)}
          inputValue={formData.telefonoCelular}
          onInputChange={(value) => updateField('telefonoCelular', value)}
          inputPlaceholder="Ingrese teléfono celular"
          error={errors.telefonoCelular}
          selectWidth="w-20"
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Correo Electrónico *"
          type="email"
          value={formData.correoElectronico}
          onChange={(e) => updateField('correoElectronico', e.target.value)}
          placeholder="Ingrese correo electrónico"
          error={errors.correoElectronico}
          required
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Estado Civil *"
          value={formData.estadoCivil}
          onChange={(e) => updateField('estadoCivil', e.target.value)}
          options={[
            { value: 'Soltero', label: 'Soltero/a' },
            { value: 'Casado', label: 'Casado/a' },
            { value: 'Divorciado', label: 'Divorciado/a' },
            { value: 'Viudo', label: 'Viudo/a' },
          ]}
          placeholder="Seleccionar estado civil"
          error={errors.estadoCivil}
          required
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Concubinato *"
          value={formData.concubinato}
          onChange={(e) => updateField('concubinato', e.target.value)}
          options={[
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' },
          ]}
          placeholder="Seleccionar opción"
          error={errors.concubinato}
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      {/* Fila 1: Tipo de Vivienda, Cantidad de Habitaciones, Cantidad de Baños */}
      <div className="col-span-1">
        <Select
          label="Tipo de Vivienda *"
          value={formData.tipoVivienda}
          onChange={(e) => updateField('tipoVivienda', e.target.value)}
          options={[
            { value: 'Quinta', label: 'Quinta' },
            { value: 'Casa Urb', label: 'Casa Urb' },
            { value: 'Apartamento', label: 'Apartamento' },
            { value: 'Bloque', label: 'Bloque' },
            { value: 'Casa de Barrio', label: 'Casa de Barrio' },
            { value: 'Casa Rural', label: 'Casa Rural' },
            { value: 'Rancho', label: 'Rancho' },
            { value: 'Refugio', label: 'Refugio' },
            { value: 'Otros', label: 'Otros' },
          ]}
          placeholder="Seleccionar tipo de vivienda"
          error={errors.tipoVivienda}
          required
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Cantidad de Habitaciones *"
          type="number"
          value={formData.cantHabitaciones}
          onChange={(e) => updateField('cantHabitaciones', e.target.value)}
          placeholder="Ingrese cantidad"
          error={errors.cantHabitaciones}
          required
          min="0"
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Cantidad de Baños *"
          type="number"
          value={formData.cantBanos}
          onChange={(e) => updateField('cantBanos', e.target.value)}
          placeholder="Ingrese cantidad"
          error={errors.cantBanos}
          required
          min="0"
        />
      </div>

      {/* Fila 2: Material del Piso, Material de Paredes, Material de Techo */}
      <div className="col-span-1">
        <Select
          label="Material del Piso *"
          value={formData.materialPiso}
          onChange={(e) => updateField('materialPiso', e.target.value)}
          options={[
            { value: 'Tierra', label: 'Tierra' },
            { value: 'Cemento', label: 'Cemento' },
            { value: 'Cerámica', label: 'Cerámica' },
            { value: 'Granito', label: 'Granito' },
            { value: 'Parquet', label: 'Parquet' },
            { value: 'Mármol', label: 'Mármol' },
          ]}
          placeholder="Seleccionar material"
          error={errors.materialPiso}
          required
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Material de Paredes *"
          value={formData.materialParedes}
          onChange={(e) => updateField('materialParedes', e.target.value)}
          options={[
            { value: 'Cartón', label: 'Cartón' },
            { value: 'Palma', label: 'Palma' },
            { value: 'Desechos', label: 'Desechos' },
            { value: 'Bahareque', label: 'Bahareque' },
            { value: 'Bloque sin frizar', label: 'Bloque sin frizar' },
            { value: 'Bloque frizado', label: 'Bloque frizado' },
          ]}
          placeholder="Seleccionar material"
          error={errors.materialParedes}
          required
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Material de Techo *"
          value={formData.materialTecho}
          onChange={(e) => updateField('materialTecho', e.target.value)}
          options={[
            { value: 'Madera', label: 'Madera' },
            { value: 'Cartón', label: 'Cartón' },
            { value: 'Palma/Zinc', label: 'Palma/Zinc' },
            { value: 'Acerolit', label: 'Acerolit' },
            { value: 'Platabanda', label: 'Platabanda' },
            { value: 'Tejas', label: 'Tejas' },
          ]}
          placeholder="Seleccionar material"
          error={errors.materialTecho}
          required
        />
      </div>

      {/* Fila 3: Agua Potable, Eliminación de Aguas Negras, Aseo */}
      <div className="col-span-1">
        <Select
          label="Agua Potable *"
          value={formData.aguaPotable}
          onChange={(e) => updateField('aguaPotable', e.target.value)}
          options={[
            { value: 'Dentro de la vivienda', label: 'Dentro de la vivienda' },
            { value: 'Fuera de la vivienda', label: 'Fuera de la vivienda' },
            { value: 'No tiene servicio', label: 'No tiene servicio' },
          ]}
          placeholder="Seleccionar opción"
          error={errors.aguaPotable}
          required
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Eliminación de Aguas Negras *"
          value={formData.eliminacionAguasN}
          onChange={(e) => updateField('eliminacionAguasN', e.target.value)}
          options={[
            { value: 'Poceta a cloaca', label: 'Poceta a cloaca' },
            { value: 'Pozo séptico', label: 'Pozo séptico' },
            { value: 'Poceta sin conexión', label: 'Poceta sin conexión' },
            { value: 'Excusado a hoyo o letrina', label: 'Excusado a hoyo o letrina' },
            { value: 'No tiene', label: 'No tiene' },
          ]}
          placeholder="Seleccionar opción"
          error={errors.eliminacionAguasN}
          required
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Aseo *"
          value={formData.aseo}
          onChange={(e) => updateField('aseo', e.target.value)}
          options={[
            { value: 'Llega a la vivienda', label: 'Llega a la vivienda' },
            { value: 'No llega a la vivienda', label: 'No llega a la vivienda' },
            { value: 'Container', label: 'Container' },
            { value: 'No tiene', label: 'No tiene' },
          ]}
          placeholder="Seleccionar opción"
          error={errors.aseo}
          required
        />
      </div>

      {/* Fila 4: Artefactos Domésticos */}
      <div className="col-span-3">
        <div className="flex flex-col gap-1">
          <label className="text-base font-normal text-foreground mb-1">Artefactos Domésticos</label>
          <div className="grid grid-cols-4 gap-x-4 gap-y-1">
            {['Nevera', 'Lavadora', 'Computadora', 'Cable Satelital', 'Internet', 'Carro', 'Moto'].map((artefacto) => {
              const isChecked = formData.artefactos.includes(artefacto);
              return (
                <label
                  key={artefacto}
                  className="flex items-center gap-2 cursor-pointer py-0.5 px-2 rounded-full transition-colors"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleArtefactoChange(artefacto, e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${isChecked 
                          ? 'bg-primary border-primary' 
                          : 'bg-[#E5E7EB] border-transparent'
                        }
                        focus-within:ring-1 focus-within:ring-primary
                      `}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-base text-foreground">{artefacto}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      {/* Fila 1: Cantidad de Personas, Cantidad de Trabajadores, Cantidad de Niños */}
      <div className="col-span-1">
        <Input
          label="Cantidad de Personas *"
          type="number"
          value={formData.cantPersonas}
          onChange={(e) => updateField('cantPersonas', e.target.value)}
          placeholder="Ingrese cantidad"
          error={errors.cantPersonas}
          required
          min="0"
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Cantidad de Trabajadores *"
          type="number"
          value={formData.cantTrabajadores}
          onChange={(e) => updateField('cantTrabajadores', e.target.value)}
          placeholder="Ingrese cantidad"
          error={errors.cantTrabajadores}
          required
          min="0"
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Cantidad de Niños *"
          type="number"
          value={formData.cantNinos}
          onChange={(e) => updateField('cantNinos', e.target.value)}
          placeholder="Ingrese cantidad"
          error={errors.cantNinos}
          required
          min="0"
        />
      </div>

      {/* Fila 2: Cantidad de Niños Estudiando, ¿Es Jefe de Hogar?, Ingresos Mensuales */}
      <div className="col-span-1">
        <Input
          label="Cantidad de Niños Estudiando *"
          type="number"
          value={formData.cantNinosEstudiando}
          onChange={(e) => updateField('cantNinosEstudiando', e.target.value)}
          placeholder="Ingrese cantidad"
          error={errors.cantNinosEstudiando}
          required
          min="0"
        />
      </div>
      <div className="col-span-1">
        <Select
          label="¿Es Jefe de Hogar? *"
          value={formData.jefeHogar}
          onChange={(e) => {
            updateField('jefeHogar', e.target.value);
            // Limpiar campos de nivel educativo si se convierte en jefe de hogar
            if (e.target.value === 'si') {
              setFormData((prev) => ({
                ...prev,
                tipoEducativo: '',
                numeroEducativo: '',
                nivelEducativo: '',
                anosCursados: '',
                semestresCursados: '',
                trimestresCursados: '',
              }));
              // Limpiar errores de nivel educativo
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.tipoEducativo;
                delete newErrors.numeroEducativo;
                delete newErrors.nivelEducativo;
                delete newErrors.anosCursados;
                delete newErrors.semestresCursados;
                delete newErrors.trimestresCursados;
                return newErrors;
              });
            }
          }}
          options={[
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' },
          ]}
          placeholder="Seleccionar opción"
          error={errors.jefeHogar}
          required
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Ingresos Mensuales *"
          type="number"
          value={formData.ingresosMensuales}
          onChange={(e) => updateField('ingresosMensuales', e.target.value)}
          placeholder="Ingrese monto"
          error={errors.ingresosMensuales}
          required
          min="0"
          step="0.01"
        />
      </div>

      {/* Campos de Nivel Educativo del Jefe de Hogar (solo si NO es jefe de hogar) */}
      {formData.jefeHogar === 'no' && (
        <>
          <div className="col-span-1">
            <Select
              label="Tipo de Educación del Jefe de Hogar *"
              value={formData.tipoEducativo}
              onChange={(e) => {
                const tipoSeleccionado = e.target.value;
                updateField('tipoEducativo', tipoSeleccionado);
                
                const numerosDisponibles = getNumerosPorTipo(tipoSeleccionado);
                
                // Si solo hay un número disponible, asignarlo automáticamente
                if (numerosDisponibles.length === 1) {
                  const numeroAuto = numerosDisponibles[0].value;
                  setFormData((prev) => ({
                    ...prev,
                    numeroEducativo: numeroAuto,
                    nivelEducativo: numeroAuto,
                    anosCursados: '',
                    semestresCursados: '',
                    trimestresCursados: '',
                  }));
                  // Limpiar errores
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.numeroEducativo;
                    delete newErrors.anosCursados;
                    delete newErrors.semestresCursados;
                    delete newErrors.trimestresCursados;
                    return newErrors;
                  });
                } else {
                  // Si hay múltiples opciones, limpiar número y nivel
                  setFormData((prev) => ({
                    ...prev,
                    numeroEducativo: '',
                    nivelEducativo: '',
                    anosCursados: '',
                    semestresCursados: '',
                    trimestresCursados: '',
                  }));
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.numeroEducativo;
                    delete newErrors.anosCursados;
                    delete newErrors.semestresCursados;
                    delete newErrors.trimestresCursados;
                    return newErrors;
                  });
                }
              }}
              options={TIPOS_EDUCACION}
              placeholder="Seleccionar tipo de educación"
              error={errors.tipoEducativo}
              required
            />
          </div>
          {formData.tipoEducativo && (
            <>
              {getNumerosPorTipo(formData.tipoEducativo).length > 1 ? (
                <div className="col-span-1">
                  <Select
                    label="Grado/Número del Jefe de Hogar *"
                    value={formData.numeroEducativo}
                    onChange={(e) => {
                      updateField('numeroEducativo', e.target.value);
                      // Calcular nivelEducativo desde el número
                      updateField('nivelEducativo', e.target.value);
                      // Limpiar campos de duración si cambia el nivel
                      const nivelNum = Number(e.target.value);
                      if (nivelNum !== 12 && nivelNum !== 13 && nivelNum !== 14) {
                        setFormData((prev) => ({
                          ...prev,
                          anosCursados: '',
                          semestresCursados: '',
                          trimestresCursados: '',
                        }));
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.anosCursados;
                          delete newErrors.semestresCursados;
                          delete newErrors.trimestresCursados;
                          return newErrors;
                        });
                      }
                    }}
                    options={getNumerosPorTipo(formData.tipoEducativo)}
                    placeholder="Seleccionar grado/número"
                    error={errors.numeroEducativo}
                    required
                  />
                </div>
              ) : (
                <div className="col-span-1">
                  <Input
                    label="Grado/Número del Jefe de Hogar *"
                    type="text"
                    value={formData.numeroEducativo || ''}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="Asignado automáticamente"
                  />
                </div>
              )}
            </>
          )}
          {/* Solo mostrar campos de duración si el nivel es 12, 13 o 14 */}
          {(Number(formData.numeroEducativo) === 12 || 
            Number(formData.numeroEducativo) === 13 || 
            Number(formData.numeroEducativo) === 14) && (
            <>
              <div className="col-span-1">
                <Input
                  label="Años Cursados del Jefe de Hogar *"
                  type="number"
                  value={formData.anosCursados}
                  onChange={(e) => {
                    const anosValue = e.target.value;
                    updateField('anosCursados', anosValue);
                    // Calcular automáticamente semestres y trimestres
                    const anosNum = Number(anosValue);
                    if (!isNaN(anosNum) && anosNum >= 0) {
                      setFormData((prev) => ({
                        ...prev,
                        anosCursados: anosValue,
                        semestresCursados: (anosNum * 2).toString(),
                        trimestresCursados: (anosNum * 4).toString(),
                      }));
                    }
                  }}
                  placeholder="Ingrese años"
                  error={errors.anosCursados}
                  required
                  min="0"
                />
              </div>
              <div className="col-span-1">
                <Input
                  label="Semestres Cursados del Jefe de Hogar *"
                  type="number"
                  value={formData.semestresCursados}
                  onChange={(e) => {
                    const semestresValue = e.target.value;
                    updateField('semestresCursados', semestresValue);
                    // Calcular automáticamente trimestres a partir de semestres
                    const semestresNum = Number(semestresValue);
                    if (!isNaN(semestresNum) && semestresNum >= 0) {
                      setFormData((prev) => ({
                        ...prev,
                        semestresCursados: semestresValue,
                        trimestresCursados: (semestresNum * 2).toString(),
                      }));
                    }
                  }}
                  placeholder="Ingrese semestres"
                  error={errors.semestresCursados}
                  required
                  min="0"
                />
              </div>
              <div className="col-span-1">
                <Input
                  label="Trimestres Cursados del Jefe de Hogar *"
                  type="number"
                  value={formData.trimestresCursados}
                  onChange={(e) => updateField('trimestresCursados', e.target.value)}
                  placeholder="Ingrese trimestres"
                  error={errors.trimestresCursados}
                  required
                  min="0"
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      {/* Fila 1: Tipo de Educación y Número */}
      <div className="col-span-1">
        <Select
          label="Tipo de Educación *"
          value={formData.tipoEducativoSolicitante}
          onChange={(e) => {
            const tipoSeleccionado = e.target.value;
            updateField('tipoEducativoSolicitante', tipoSeleccionado);
            
            const numerosDisponibles = getNumerosPorTipo(tipoSeleccionado);
            
            // Si solo hay un número disponible, asignarlo automáticamente
            if (numerosDisponibles.length === 1) {
              const numeroAuto = numerosDisponibles[0].value;
              setFormData((prev) => ({
                ...prev,
                numeroEducativoSolicitante: numeroAuto,
                nivelEducativoSolicitante: numeroAuto,
                anosCursadosSolicitante: '',
                semestresCursadosSolicitante: '',
                trimestresCursadosSolicitante: '',
              }));
              // Limpiar errores
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.numeroEducativoSolicitante;
                delete newErrors.anosCursadosSolicitante;
                delete newErrors.semestresCursadosSolicitante;
                delete newErrors.trimestresCursadosSolicitante;
                return newErrors;
              });
            } else {
              // Si hay múltiples opciones, limpiar número y nivel
              setFormData((prev) => ({
                ...prev,
                numeroEducativoSolicitante: '',
                nivelEducativoSolicitante: '',
                anosCursadosSolicitante: '',
                semestresCursadosSolicitante: '',
                trimestresCursadosSolicitante: '',
              }));
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.numeroEducativoSolicitante;
                delete newErrors.anosCursadosSolicitante;
                delete newErrors.semestresCursadosSolicitante;
                delete newErrors.trimestresCursadosSolicitante;
                return newErrors;
              });
            }
          }}
          options={TIPOS_EDUCACION}
          placeholder="Seleccionar tipo de educación"
          error={errors.tipoEducativoSolicitante}
          required
        />
      </div>
      {formData.tipoEducativoSolicitante && (
        <>
          {getNumerosPorTipo(formData.tipoEducativoSolicitante).length > 1 ? (
            <div className="col-span-1">
              <Select
                label="Grado/Número *"
                value={formData.numeroEducativoSolicitante}
                onChange={(e) => {
                  updateField('numeroEducativoSolicitante', e.target.value);
                  // Calcular nivelEducativoSolicitante desde el número
                  updateField('nivelEducativoSolicitante', e.target.value);
                  // Limpiar campos de duración si cambia el nivel
                  const nivelNum = Number(e.target.value);
                  if (nivelNum !== 12 && nivelNum !== 13 && nivelNum !== 14) {
                    setFormData((prev) => ({
                      ...prev,
                      anosCursadosSolicitante: '',
                      semestresCursadosSolicitante: '',
                      trimestresCursadosSolicitante: '',
                    }));
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.anosCursadosSolicitante;
                      delete newErrors.semestresCursadosSolicitante;
                      delete newErrors.trimestresCursadosSolicitante;
                      return newErrors;
                    });
                  }
                }}
                options={getNumerosPorTipo(formData.tipoEducativoSolicitante)}
                placeholder="Seleccionar grado/número"
                error={errors.numeroEducativoSolicitante}
                required
              />
            </div>
          ) : (
            <div className="col-span-1">
              <Input
                label="Grado/Número *"
                type="text"
                value={formData.numeroEducativoSolicitante || ''}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
                placeholder="Asignado automáticamente"
              />
            </div>
          )}
        </>
      )}
      {/* Solo mostrar campos de duración si el nivel es 12, 13 o 14 */}
      {(Number(formData.numeroEducativoSolicitante) === 12 || 
        Number(formData.numeroEducativoSolicitante) === 13 || 
        Number(formData.numeroEducativoSolicitante) === 14) && (
        <>
          <div className="col-span-1">
            <Input
              label="Años Cursados *"
              type="number"
              value={formData.anosCursadosSolicitante}
              onChange={(e) => {
                const anosValue = e.target.value;
                updateField('anosCursadosSolicitante', anosValue);
                // Calcular automáticamente semestres y trimestres
                const anosNum = Number(anosValue);
                if (!isNaN(anosNum) && anosNum >= 0) {
                  setFormData((prev) => ({
                    ...prev,
                    anosCursadosSolicitante: anosValue,
                    semestresCursadosSolicitante: (anosNum * 2).toString(),
                    trimestresCursadosSolicitante: (anosNum * 4).toString(),
                  }));
                }
              }}
              placeholder="Ingrese años"
              error={errors.anosCursadosSolicitante}
              required
              min="0"
            />
          </div>
          <div className="col-span-1">
            <Input
              label="Semestres Cursados *"
              type="number"
              value={formData.semestresCursadosSolicitante}
              onChange={(e) => {
                const semestresValue = e.target.value;
                updateField('semestresCursadosSolicitante', semestresValue);
                // Calcular automáticamente trimestres a partir de semestres
                const semestresNum = Number(semestresValue);
                if (!isNaN(semestresNum) && semestresNum >= 0) {
                  setFormData((prev) => ({
                    ...prev,
                    semestresCursadosSolicitante: semestresValue,
                    trimestresCursadosSolicitante: (semestresNum * 2).toString(),
                  }));
                }
              }}
              placeholder="Ingrese semestres"
              error={errors.semestresCursadosSolicitante}
              required
              min="0"
            />
          </div>
          <div className="col-span-1">
            <Input
              label="Trimestres Cursados *"
              type="number"
              value={formData.trimestresCursadosSolicitante}
              onChange={(e) => updateField('trimestresCursadosSolicitante', e.target.value)}
              placeholder="Ingrese trimestres"
              error={errors.trimestresCursadosSolicitante}
              required
              min="0"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      {/* Pregunta principal: ¿Trabaja? */}
      <div className="col-span-1">
        <Select
          label="¿Trabaja? *"
          value={formData.trabaja}
          onChange={(e) => {
            updateField('trabaja', e.target.value);
            // Limpiar campos relacionados cuando cambia la respuesta
            setFormData((prev) => ({
              ...prev,
              trabaja: e.target.value,
              condicionTrabajo: '',
              buscandoTrabajo: '',
              condicionActividad: '',
            }));
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.condicionTrabajo;
              delete newErrors.buscandoTrabajo;
              delete newErrors.condicionActividad;
              return newErrors;
            });
          }}
          options={[
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' },
          ]}
          placeholder="Seleccionar opción"
          error={errors.trabaja}
          required
        />
      </div>

      {/* Si trabaja: Condición en el trabajo */}
      {formData.trabaja === 'si' && (
        <div className="col-span-1">
          <Select
            label="Condición en el Trabajo *"
            value={formData.condicionTrabajo}
            onChange={(e) => updateField('condicionTrabajo', e.target.value)}
            options={[
              { value: 'Patrono', label: 'Patrono' },
              { value: 'Empleado', label: 'Empleado' },
              { value: 'Obrero', label: 'Obrero' },
              { value: 'Cuenta propia', label: 'Cuenta propia' },
            ]}
            placeholder="Seleccionar condición"
            error={errors.condicionTrabajo}
            required
          />
        </div>
      )}

      {/* Si no trabaja: ¿Está buscando Trabajo? */}
      {formData.trabaja === 'no' && (
        <div className="col-span-1">
          <Select
            label="¿Está buscando Trabajo? *"
            value={formData.buscandoTrabajo}
            onChange={(e) => {
              updateField('buscandoTrabajo', e.target.value);
              // Limpiar condición de actividad si cambia la respuesta
              if (e.target.value === 'si') {
                setFormData((prev) => ({
                  ...prev,
                  buscandoTrabajo: e.target.value,
                  condicionActividad: '',
                }));
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.condicionActividad;
                  return newErrors;
                });
              }
            }}
            options={[
              { value: 'si', label: 'Sí' },
              { value: 'no', label: 'No' },
            ]}
            placeholder="Seleccionar opción"
            error={errors.buscandoTrabajo}
            required
          />
        </div>
      )}

      {/* Si no trabaja y no está buscando trabajo: Condición de actividad */}
      {formData.trabaja === 'no' && formData.buscandoTrabajo === 'no' && (
        <div className="col-span-1">
          <Select
            label="Condición de Actividad *"
            value={formData.condicionActividad}
            onChange={(e) => updateField('condicionActividad', e.target.value)}
            options={[
              { value: 'Ama de Casa', label: 'Ama de Casa' },
              { value: 'Estudiante', label: 'Estudiante' },
              { value: 'Pensionado', label: 'Pensionado' },
              { value: 'Jubilado', label: 'Jubilado' },
              { value: 'Otra', label: 'Otra' },
            ]}
            placeholder="Seleccionar condición"
            error={errors.condicionActividad}
            required
          />
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1(); // Identificación
      case 1:
        return renderStep4(); // Nivel Educativo del Solicitante
      case 2:
        return renderStep5(); // Trabajo
      case 3:
        return renderStep2(); // Vivienda
      case 4:
        return renderStep3(); // Familia y Hogar
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
        <div className="flex flex-col border-t border-gray-200">
          {/* Nota sobre campos obligatorios */}
          <div className="flex items-center gap-1 pt-2 pb-4">
            <span className="text-danger font-medium text-sm">*</span>
            <span className="text-sm text-gray-600">Campo obligatorio</span>
          </div>
          
          <div className="flex justify-end gap-4">
            {currentStep > 0 && (
              <Button variant="outline" size="xl" onClick={handleBack}>
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
      </div>
    </Modal>
  );
}

