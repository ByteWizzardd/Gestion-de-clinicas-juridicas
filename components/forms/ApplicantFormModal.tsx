'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
  nacionalidad: string;
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

// Estado inicial del formulario (reutilizable)
const getInitialFormData = (): FormData => ({
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
  nacionalidad: 'V', // Por defecto venezolano cuando el tipo es 'V'
  tipoVivienda: '',
  cantHabitaciones: '',
  cantBanos: '',
  materialPiso: '',
  materialParedes: '',
  materialTecho: '',
  aguaPotable: '',
  eliminacionAguasN: '',
  aseo: '',
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

export default function ApplicantFormModal({
  isOpen,
  onClose,
  onSubmit,
}: ApplicantFormModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(getInitialFormData());

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [cedulaCheckTimeout, setCedulaCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Estados para recomendaciones de cédula
  const [cedulaSuggestions, setCedulaSuggestions] = useState<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string;
    telefono_celular: string;
    correo_electronico: string;
    sexo: string;
    nacionalidad: string;
    nombre_completo: string;
  }>>([]);
  const [showCedulaSuggestions, setShowCedulaSuggestions] = useState(false);
  const cedulaInputRef = useRef<HTMLDivElement>(null);
  const cedulaSearchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Estado para controlar qué campos están bloqueados (autocompletados)
  const [lockedFields, setLockedFields] = useState<Set<keyof FormData>>(new Set());

  // Helper para limpiar errores de campos específicos
  const clearErrors = (fieldNames: (keyof FormData)[]) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      fieldNames.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  };

  // Helper para limpiar campos de duración educativa
  const clearDuracionFields = (prefix: 'Solicitante' | 'JefeHogar') => {
    if (prefix === 'Solicitante') {
      setFormData((prev) => ({
        ...prev,
        anosCursadosSolicitante: '',
        semestresCursadosSolicitante: '',
        trimestresCursadosSolicitante: '',
      }));
      clearErrors(['anosCursadosSolicitante', 'semestresCursadosSolicitante', 'trimestresCursadosSolicitante']);
    } else {
      setFormData((prev) => ({
        ...prev,
        anosCursados: '',
        semestresCursados: '',
        trimestresCursados: '',
      }));
      clearErrors(['anosCursados', 'semestresCursados', 'trimestresCursados']);
    }
  };

  // Helper para manejar cambio de tipo educativo
  const handleTipoEducativoChange = (
    tipoSeleccionado: string,
    prefix: 'Solicitante' | 'JefeHogar'
  ) => {
    const tipoField = prefix === 'Solicitante' ? 'tipoEducativoSolicitante' : 'tipoEducativo';
    const numeroField = prefix === 'Solicitante' ? 'numeroEducativoSolicitante' : 'numeroEducativo';
    const nivelField = prefix === 'Solicitante' ? 'nivelEducativoSolicitante' : 'nivelEducativo';
    
    updateField(tipoField as keyof FormData, tipoSeleccionado);
    
    const numerosDisponibles = getNumerosPorTipo(tipoSeleccionado);
    
    if (numerosDisponibles.length === 1) {
      const numeroAuto = numerosDisponibles[0].value;
      setFormData((prev) => ({
        ...prev,
        [tipoField]: tipoSeleccionado,
        [numeroField]: numeroAuto,
        [nivelField]: numeroAuto,
      }));
      clearDuracionFields(prefix);
      clearErrors([numeroField as keyof FormData]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [tipoField]: tipoSeleccionado,
        [numeroField]: '',
        [nivelField]: '',
      }));
      clearDuracionFields(prefix);
      clearErrors([numeroField as keyof FormData]);
    }
  };

  // Helper para manejar cambio de número educativo
  const handleNumeroEducativoChange = (
    value: string,
    prefix: 'Solicitante' | 'JefeHogar'
  ) => {
    const numeroField = prefix === 'Solicitante' ? 'numeroEducativoSolicitante' : 'numeroEducativo';
    const nivelField = prefix === 'Solicitante' ? 'nivelEducativoSolicitante' : 'nivelEducativo';
    
    updateField(numeroField as keyof FormData, value);
    updateField(nivelField as keyof FormData, value);
    
    const nivelNum = Number(value);
    if (nivelNum !== 12 && nivelNum !== 13 && nivelNum !== 14) {
      clearDuracionFields(prefix);
    }
  };

  // Helper para calcular duración desde años
  const handleAnosChange = (
    anosValue: string,
    prefix: 'Solicitante' | 'JefeHogar'
  ) => {
    const anosField = prefix === 'Solicitante' ? 'anosCursadosSolicitante' : 'anosCursados';
    const semestresField = prefix === 'Solicitante' ? 'semestresCursadosSolicitante' : 'semestresCursados';
    const trimestresField = prefix === 'Solicitante' ? 'trimestresCursadosSolicitante' : 'trimestresCursados';
    
    updateField(anosField as keyof FormData, anosValue);
    const anosNum = Number(anosValue);
    if (!isNaN(anosNum) && anosNum >= 0) {
      setFormData((prev) => ({
        ...prev,
        [anosField]: anosValue,
        [semestresField]: (anosNum * 2).toString(),
        [trimestresField]: (anosNum * 4).toString(),
      }));
    }
  };

  // Helper para calcular trimestres desde semestres
  const handleSemestresChange = (
    semestresValue: string,
    prefix: 'Solicitante' | 'JefeHogar'
  ) => {
    const semestresField = prefix === 'Solicitante' ? 'semestresCursadosSolicitante' : 'semestresCursados';
    const trimestresField = prefix === 'Solicitante' ? 'trimestresCursadosSolicitante' : 'trimestresCursados';
    
    updateField(semestresField as keyof FormData, semestresValue);
    const semestresNum = Number(semestresValue);
    if (!isNaN(semestresNum) && semestresNum >= 0) {
      setFormData((prev) => ({
        ...prev,
        [semestresField]: semestresValue,
        [trimestresField]: (semestresNum * 2).toString(),
      }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Validar cédula
    if (!formData.cedulaNumero.trim()) {
      newErrors.cedulaNumero = 'Este campo es requerido';
    }
    
    // Validar nombres
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Este campo es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(formData.nombres.trim())) {
      newErrors.nombres = 'Solo se permiten letras y espacios';
    }
    
    // Validar apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Este campo es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(formData.apellidos.trim())) {
      newErrors.apellidos = 'Solo se permiten letras y espacios';
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
    } else if (!/^[0-9]+$/.test(formData.telefonoCelular.trim())) {
      newErrors.telefonoCelular = 'Solo se permiten números';
    } else {
      const telefonoCelular = formData.telefonoCelular.trim();
      const telefonoCelularLength = telefonoCelular.length;
      
      // Para números venezolanos (+58), el número debe tener 10 dígitos (sin el cero inicial)
      // Ejemplo: 4122727981 (sin el 0 inicial, se guarda como +584122727981)
      if (formData.codigoPaisCelular === '+58') {
        if (telefonoCelular.startsWith('0') || telefonoCelularLength !== 10 || !/^[4][0-9]{9}$/.test(telefonoCelular)) {
          newErrors.telefonoCelular = 'Número de teléfono inválido';
        }
      } else {
        // Para otros países, validar longitud mínima y máxima
        if (telefonoCelularLength < 7 || telefonoCelularLength > 15) {
          newErrors.telefonoCelular = 'Número de teléfono inválido';
        }
      }
    }
    
    // Validar teléfono local (si está presente)
    if (formData.telefonoLocal.trim()) {
      if (!/^[0-9]+$/.test(formData.telefonoLocal.trim())) {
        newErrors.telefonoLocal = 'Solo se permiten números';
      } else {
        const telefonoLocalLength = formData.telefonoLocal.trim().length;
        // Validar longitud: números locales venezolanos típicamente tienen 7 dígitos
        if (telefonoLocalLength < 7) {
          newErrors.telefonoLocal = 'El teléfono local debe tener al menos 7 dígitos';
        } else if (telefonoLocalLength > 10) {
          newErrors.telefonoLocal = 'El teléfono local no puede tener más de 10 dígitos';
        }
      }
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

    // Validar nacionalidad (solo si el tipo de cédula es 'P')
    if (formData.cedulaTipo === 'P') {
      if (!formData.nacionalidad || formData.nacionalidad.trim() === '') {
        newErrors.nacionalidad = 'Este campo es requerido';
      } else if (!['V', 'Ext'].includes(formData.nacionalidad)) {
        newErrors.nacionalidad = 'Nacionalidad inválida';
      }
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

    // Validaciones de congruencia entre campos
    // Debe haber al menos un adulto (cantPersonas > cantNinos)
    if (!newErrors.cantPersonas && !newErrors.cantNinos && cantPersonasValue > 0 && cantNinosValue >= cantPersonasValue) {
      newErrors.cantNinos = `Debe haber al menos un adulto. Si hay ${cantPersonasValue} persona(s), no puede haber ${cantNinosValue} niño(s)`;
    }

    // Si el solicitante NO es jefe de hogar, debe haber al menos 2 personas (solicitante + jefe de hogar)
    if (!newErrors.cantPersonas && !newErrors.jefeHogar && formData.jefeHogar === 'no' && cantPersonasValue < 2) {
      newErrors.cantPersonas = 'Si no eres jefe de hogar, debe haber al menos 2 personas (tú y el jefe de hogar)';
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
        const { createSolicitanteAction } = await import('@/app/actions/solicitantes');
        const result = await createSolicitanteAction(formData);

        if (!result.success) {
          const errorMessage = result.error?.message || 'Error al registrar solicitante';
          throw new Error(errorMessage);
        }

        // Llamar al callback de éxito (recarga la lista y maneja el modal de confirmación)
        // El componente padre ahora maneja el modal de confirmación
        onSubmit(result);
      } catch (error: any) {
        const errorMessage = error?.message || 'Error al registrar solicitante. Por favor, intente nuevamente.';
        alert(errorMessage);
      }
    }
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cedulaInputRef.current && !cedulaInputRef.current.contains(event.target as Node)) {
        setShowCedulaSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      if (cedulaCheckTimeout) {
        clearTimeout(cedulaCheckTimeout);
      }
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }
      if (cedulaSearchTimeout.current) {
        clearTimeout(cedulaSearchTimeout.current);
      }
    };
  }, [cedulaCheckTimeout, emailCheckTimeout]);

  const handleClose = () => {
    // Limpiar timeouts al cerrar
    if (cedulaCheckTimeout) {
      clearTimeout(cedulaCheckTimeout);
      setCedulaCheckTimeout(null);
    }
    
    setCurrentStep(0);
    setFormData(getInitialFormData());
    setErrors({});
    onClose();
  };

  // Función para filtrar solo letras (incluyendo espacios y acentos)
  const filterOnlyLetters = (value: string): string => {
    // Permite solo letras (incluyendo acentos) y espacios
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
  };

  // Función para filtrar solo números
  const filterOnlyNumbers = (value: string): string => {
    // Permite solo números
    return value.replace(/[^0-9]/g, '');
  };

  // Función para filtrar código de país (números y +)
  const filterCountryCode = (value: string): string => {
    // Permite solo números y el símbolo + al inicio
    if (value.startsWith('+')) {
      return '+' + value.slice(1).replace(/[^0-9]/g, '');
    }
    return value.replace(/[^0-9+]/g, '');
  };

  const updateField = (field: keyof FormData, value: string) => {
    // Si el usuario cambia la cédula después de autocompletar, desbloquear todo y limpiar campos (incluyendo correo)
    if ((field === 'cedulaTipo' || field === 'cedulaNumero') && lockedFields.size > 0) {
      // Limpiar campos autocompletados (incluyendo correo)
      setFormData((prev) => ({
        ...prev,
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        sexo: '',
        telefonoCelular: '',
        codigoPaisCelular: '+58',
        correoElectronico: '',
        nacionalidad: '',
        [field]: value, // Actualizar el campo que se está modificando
      }));
      // Desbloquear todos los campos
      setLockedFields(new Set());
      // Limpiar sugerencias
      setCedulaSuggestions([]);
      setShowCedulaSuggestions(false);
      // Limpiar errores
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.cedulaNumero;
        return newErrors;
      });
      return;
    }

    // Asignar nacionalidad automáticamente según el tipo de cédula
    if (field === 'cedulaTipo') {
      let nacionalidadAsignada = '';
      if (value === 'V' || value === 'J') {
        nacionalidadAsignada = 'V'; // Venezolano
      } else if (value === 'E') {
        nacionalidadAsignada = 'Ext'; // Extranjero
      } else if (value === 'P') {
        nacionalidadAsignada = ''; // Dejar vacío para que el usuario elija
      }
      
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        nacionalidad: nacionalidadAsignada,
      }));
      
      // Limpiar error de nacionalidad si se asignó automáticamente
      if (nacionalidadAsignada && errors.nacionalidad) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.nacionalidad;
          return newErrors;
        });
      }
      
      // Limpiar error del campo cuando se modifica
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      return;
    }

    // No permitir editar campos bloqueados (autocompletados)
    if (lockedFields.has(field)) {
      return;
    }

    // Filtrar caracteres especiales según el tipo de campo
    let filteredValue = value;
    if (field === 'nombres' || field === 'apellidos') {
      filteredValue = filterOnlyLetters(value);
    } else if (field === 'telefonoLocal' || field === 'telefonoCelular') {
      filteredValue = filterOnlyNumbers(value);
    } else if (field === 'codigoPaisCelular') {
      filteredValue = filterCountryCode(value);
    }
    
    setFormData((prev) => ({ ...prev, [field]: filteredValue }));
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Verificar correo electrónico si se modificó
    if (field === 'correoElectronico') {
      checkEmailExists(filteredValue);
    }
  };

  // Función para verificar si la cédula ya existe como solicitante y buscar recomendaciones
  const checkCedulaExists = async (cedulaTipo: string, cedulaNumero: string) => {
    if (!cedulaNumero || cedulaNumero.trim() === '') {
      setCedulaSuggestions([]);
      setShowCedulaSuggestions(false);
      return;
    }

    const cedula = `${cedulaTipo}${cedulaNumero}`;
    
    try {
      // Primero verificar si es solicitante usando Server Action
      const { searchSolicitantesAction } = await import('@/app/actions/solicitantes');
      const solicitanteResult = await searchSolicitantesAction(cedula, 'cedula');

      if (solicitanteResult.success && solicitanteResult.data) {
        // Buscar si hay una coincidencia exacta
        const solicitanteExistente = solicitanteResult.data.find((s: any) => s.cedula === cedula);
        
        if (solicitanteExistente) {
          setErrors((prev) => ({
            ...prev,
            cedulaNumero: `La cédula ${cedula} ya está registrada como solicitante`,
          }));
          setCedulaSuggestions([]);
          setShowCedulaSuggestions(false);
          return; // No buscar recomendaciones si es solicitante
        }
      }

      // Si no es solicitante, buscar recomendaciones de usuarios del sistema
      // Permitir búsqueda con 1 carácter o más
      if (cedulaNumero.trim().length >= 1) {
        if (cedulaSearchTimeout.current) {
          clearTimeout(cedulaSearchTimeout.current);
        }
        
        cedulaSearchTimeout.current = setTimeout(async () => {
          try {
            const { searchUsuariosAction } = await import('@/app/actions/solicitantes');
            const result = await searchUsuariosAction(cedula, true);

            if (result.success && result.data) {
            // Formatear fechas
            const formattedData = result.data.map((c: any) => ({
              ...c,
              fecha_nacimiento: c.fecha_nacimiento ? new Date(c.fecha_nacimiento).toISOString().split('T')[0] : null,
            }));
            setCedulaSuggestions(formattedData);
            setShowCedulaSuggestions(formattedData.length > 0 && !errors.cedulaNumero);
            
            // Si hay una coincidencia exacta, autocompletar automáticamente
            const exactMatch = formattedData.find((c: any) => c.cedula === cedula);
            if (exactMatch) {
              autocompleteFromSolicitante(exactMatch);
            }
        } else {
              setCedulaSuggestions([]);
              setShowCedulaSuggestions(false);
            }
          } catch (error) {
            setCedulaSuggestions([]);
            setShowCedulaSuggestions(false);
          }
        }, 300);
      } else {
        setCedulaSuggestions([]);
        setShowCedulaSuggestions(false);
      }

      // Limpiar el error si la cédula no existe como solicitante
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.cedulaNumero;
            return newErrors;
          });
    } catch (error) {
      // No mostrar error al usuario si falla la verificación
    }
  };

  // Función para verificar si el correo electrónico ya existe como solicitante
  const checkEmailExists = async (email: string) => {
    if (!email || email.trim() === '') {
      // Limpiar el error si el campo está vacío
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.correoElectronico;
        return newErrors;
      });
      return;
    }

    // Validar formato de email básico antes de verificar
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      // No verificar si el formato es inválido, la validación de formato se hará en validateStep1
      return;
    }

    // Limpiar timeout anterior si existe
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }

    // Esperar 500ms después de que el usuario deje de escribir
    const timeout = setTimeout(async () => {
      try {
        const { searchSolicitantesAction } = await import('@/app/actions/solicitantes');
        const result = await searchSolicitantesAction(email, 'email');

        if (result.success && result.data && result.data.length > 0) {
          // El correo ya está asociado a otra persona (usuario o solicitante)
          setErrors((prev) => ({
            ...prev,
            correoElectronico: `El correo electrónico ${email} ya está asociado a otra persona`,
          }));
        } else {
          // Limpiar el error si el correo no existe como solicitante
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.correoElectronico;
            return newErrors;
          });
      }
    } catch (error) {
      // No mostrar error al usuario si falla la verificación
    }
    }, 500);

    setEmailCheckTimeout(timeout);
  };

  // Función para autocompletar el formulario con datos de un solicitante
  const autocompleteFromSolicitante = (solicitante: {
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string;
    telefono_celular: string;
    correo_electronico: string;
    sexo: string;
    nacionalidad: string;
  }) => {
    // Extraer tipo y número de cédula
    let cedulaTipo = 'V';
    let cedulaNumero = solicitante.cedula || '';
    if (cedulaNumero.match(/^[VEJP]/)) {
      cedulaTipo = cedulaNumero[0];
      cedulaNumero = cedulaNumero.substring(1);
    }

    // Extraer código de país y número de teléfono celular
    let codigoPaisCelular = '+58';
    let telefonoCelular = solicitante.telefono_celular || '';
    if (telefonoCelular.startsWith('+58')) {
      codigoPaisCelular = '+58';
      telefonoCelular = telefonoCelular.substring(3);
    } else if (telefonoCelular.startsWith('+')) {
      const match = telefonoCelular.match(/^(\+\d{1,3})(.+)$/);
      if (match) {
        codigoPaisCelular = match[1];
        telefonoCelular = match[2];
      }
    }

    // Asignar nacionalidad según el tipo de cédula
    let nacionalidadAsignada = '';
    if (cedulaTipo === 'V' || cedulaTipo === 'J') {
      nacionalidadAsignada = 'V'; // Venezolano
    } else if (cedulaTipo === 'E') {
      nacionalidadAsignada = 'Ext'; // Extranjero
    } else if (cedulaTipo === 'P') {
      // Si es pasaporte, usar la nacionalidad del solicitante o dejar vacío
      nacionalidadAsignada = solicitante.nacionalidad || '';
    }

    // Actualizar el formulario con los datos del solicitante
    setFormData((prev) => ({
      ...prev,
      cedulaTipo,
      cedulaNumero,
      nombres: solicitante.nombres || '',
      apellidos: solicitante.apellidos || '',
      fechaNacimiento: solicitante.fecha_nacimiento || '',
      sexo: solicitante.sexo || '',
      telefonoCelular,
      codigoPaisCelular,
      correoElectronico: solicitante.correo_electronico || '',
      nacionalidad: nacionalidadAsignada,
    }));

    // Bloquear los campos autocompletados (incluyendo correo, pero cédula sigue editable)
    setLockedFields(new Set([
      'nombres',
      'apellidos',
      'fechaNacimiento',
      'sexo',
      'telefonoCelular',
      'codigoPaisCelular',
      'correoElectronico',
      'nacionalidad',
    ]));

    // Limpiar errores y ocultar sugerencias
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cedulaNumero;
      return newErrors;
    });
    setShowCedulaSuggestions(false);
    setCedulaSuggestions([]);
  };


  const renderStep1 = () => (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      {/* Fila 1: Cédula, Nombres, Apellidos */}
      <div className="col-span-1 relative" ref={cedulaInputRef}>
        <InputGroup
          label="Cédula *"
          selectValue={formData.cedulaTipo}
          selectOptions={[
            { value: 'V', label: 'V' },
            { value: 'E', label: 'E' },
            { value: 'J', label: 'J' },
            { value: 'P', label: 'P' },
          ]}
          onSelectChange={(value) => {
            updateField('cedulaTipo', value);
            // Asignar nacionalidad automáticamente según el tipo de cédula
            // (esto se maneja dentro de updateField)
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
        {/* Lista de sugerencias de cédula */}
        <AnimatePresence>
          {showCedulaSuggestions && cedulaSuggestions.length > 0 && !errors.cedulaNumero && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {cedulaSuggestions.map((solicitante, index) => (
                <motion.button
                  key={solicitante.cedula}
                  type="button"
                  onClick={() => {
                    autocompleteFromSolicitante(solicitante);
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.15 }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                >
                  <div className="font-medium text-gray-900">{solicitante.cedula}</div>
                  <div className="text-sm text-gray-600">{solicitante.nombre_completo}</div>
                </motion.button>
              ))}
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
          required
          disabled={lockedFields.has('nombres')}
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
          disabled={lockedFields.has('apellidos')}
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
              disabled={lockedFields.has('fechaNacimiento')}
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
          disabled={lockedFields.has('sexo')}
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Teléfono Local"
          value={formData.telefonoLocal}
          onChange={(e) => updateField('telefonoLocal', e.target.value)}
          placeholder="Ingrese teléfono local"
          type="tel"
          error={errors.telefonoLocal}
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
          editableCode={true}
          disabled={lockedFields.has('telefonoCelular') || lockedFields.has('codigoPaisCelular')}
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
          disabled={lockedFields.size > 0}
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

      {/* Campo de Nacionalidad (solo visible cuando el tipo de cédula es 'P') */}
      {formData.cedulaTipo === 'P' && (
        <div className="col-span-1">
          <Select
            label="Nacionalidad *"
            value={formData.nacionalidad}
            onChange={(e) => updateField('nacionalidad', e.target.value)}
            options={[
              { value: 'V', label: 'Venezolano/a' },
              { value: 'Ext', label: 'Extranjero/a' },
            ]}
            placeholder="Seleccionar nacionalidad"
            error={errors.nacionalidad}
            required
            disabled={lockedFields.has('nacionalidad')}
          />
        </div>
      )}
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
            { value: 'Granito / Parquet / Mármol', label: 'Granito / Parquet / Mármol' },
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
            { value: 'Cartón / Palma / Desechos', label: 'Cartón / Palma / Desechos' },
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
            { value: 'Madera / Cartón / Palma', label: 'Madera / Cartón / Palma' },
            { value: 'Zinc / Acerolit', label: 'Zinc / Acerolit' },
            { value: 'Platabanda / Tejas', label: 'Platabanda / Tejas' },
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
            { value: 'Poceta a cloaca / Pozo séptico', label: 'Poceta a cloaca / Pozo séptico' },
            { value: 'Poceta sin conexión', label: 'Poceta sin conexión' },
            { value: 'Excusado de hoyo o letrina', label: 'Excusado de hoyo o letrina' },
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
            { value: 'No llega a la vivienda / Container', label: 'No llega a la vivienda / Container' },
            { value: 'No tiene', label: 'No tiene' },
          ]}
          placeholder="Seleccionar opción"
          error={errors.aseo}
          required
        />
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

      {/* Fila 2: Cantidad de Niños Estudiando, Ingresos Mensuales, ¿Es Jefe de Hogar? */}
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
        <Input
          label="Ingresos Mensuales (USD) *"
          type="number"
          value={formData.ingresosMensuales}
          onChange={(e) => updateField('ingresosMensuales', e.target.value)}
          placeholder="Ingrese monto en dólares"
          error={errors.ingresosMensuales}
          required
          min="0"
          step="0.01"
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
              clearErrors(['tipoEducativo', 'numeroEducativo', 'nivelEducativo', 'anosCursados', 'semestresCursados', 'trimestresCursados']);
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

      {/* Campos de Nivel Educativo del Jefe de Hogar (solo si NO es jefe de hogar) */}
      {formData.jefeHogar === 'no' && (
        <>
          <div className="col-span-1">
            <Select
              label="Tipo de Educación del Jefe de Hogar *"
              value={formData.tipoEducativo}
              onChange={(e) => handleTipoEducativoChange(e.target.value, 'JefeHogar')}
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
                    onChange={(e) => handleNumeroEducativoChange(e.target.value, 'JefeHogar')}
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
                  onChange={(e) => handleAnosChange(e.target.value, 'JefeHogar')}
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
                  onChange={(e) => handleSemestresChange(e.target.value, 'JefeHogar')}
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
          onChange={(e) => handleTipoEducativoChange(e.target.value, 'Solicitante')}
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
                onChange={(e) => handleNumeroEducativoChange(e.target.value, 'Solicitante')}
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
              onChange={(e) => handleAnosChange(e.target.value, 'Solicitante')}
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
              onChange={(e) => handleSemestresChange(e.target.value, 'Solicitante')}
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
    <>
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
  </>
  );
}

