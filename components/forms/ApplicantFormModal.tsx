'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Modal from '../ui/feedback/Modal';
import Stepper from './Stepper';
import Input from './Input';
import InputGroup from './InputGroup';
import PhoneInput from './PhoneInput';
import Select from './Select';
import Button from '../ui/Button';
import { ArrowRight, ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import DatePicker from './DatePicker';
import { validateEmailFormat } from '@/lib/utils/email-validation';

interface ApplicantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => void;
  initialData?: any;
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
  telefonoCelular: string; // Almacenará el número completo: +58412...
  correoElectronico: string;
  estadoCivil: string;
  concubinato: string;
  nacionalidad: string;
  // Paso 2 - Ubicación
  idEstado: string;
  numMunicipio: string;
  numParroquia: string;
  direccionHabitacion: string;
  // Paso 3 - Vivienda
  tipoVivienda: string;
  cantHabitaciones: string;
  cantBanos: string;
  materialPiso: string;
  materialParedes: string;
  materialTecho: string;
  aguaPotable: string;
  eliminacionAguasN: string;
  aseo: string;
  artefactosDomesticos: string[]; // Array de artefactos seleccionados
  // Paso 4 - Familia y Hogar
  cantPersonas: string;
  cantTrabajadores: string;
  cantNinos: string;
  cantNinosEstudiando: string;
  jefeHogar: string;
  tipoEducativo: string; // Tipo de educación del jefe de hogar
  numeroEducativo: string; // Número/grado específico del jefe de hogar
  nivelEducativo: string; // Se mantiene para compatibilidad, se calculará desde tipo y número
  tipoTiempoEstudioJefe: string; // Tipo de tiempo: 'Años', 'Semestres', 'Trimestres'
  tiempoEstudioJefe: string; // Cantidad de tiempo de estudio del jefe
  ingresosMensuales: string;
  // Paso 5 - Nivel Educativo del Solicitante
  tipoEducativoSolicitante: string; // Tipo de educación del solicitante
  numeroEducativoSolicitante: string; // Número/grado específico del solicitante
  nivelEducativoSolicitante: string; // Se mantiene para compatibilidad, se calculará desde tipo y número
  tipoTiempoEstudioSolicitante: string; // Tipo de tiempo: 'Años', 'Semestres', 'Trimestres'
  tiempoEstudioSolicitante: string; // Cantidad de tiempo de estudio
  // Paso 6 - Trabajo
  trabaja: string; // ¿Trabaja? (si/no)
  condicionTrabajo: string; // Condición en el trabajo (si trabaja)
  buscandoTrabajo: string; // ¿Está buscando trabajo? (si no trabaja)
  condicionActividad: string; // Condición de actividad (si no trabaja y no busca trabajo)
}

const STEPS = [
  'Identificación',
  'Ubicación',
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

/**
 * Extrae el código de país de un número telefónico internacional.
 * Usa una lista de códigos conocidos ordenados por longitud (más largos primero).
 */
function extractCountryCode(phoneNumber: string): string {
  // Códigos de país comunes ordenados por longitud descendente (más largos primero para evitar conflictos)
  const knownCodes = [
    '+1787', '+1809', '+1829', '+1849', // Puerto Rico, Rep. Dominicana
    '+598', '+595', '+593', '+592', '+591', '+507', '+506', '+505', '+504', '+503', '+502', '+501', // Latinoamérica 3 dígitos
    '+58', '+57', '+56', '+55', '+54', '+53', '+52', '+51', // Venezuela, Colombia, Chile, Brasil, Argentina, Cuba, México, Perú
    '+34', '+33', '+31', '+30', // España, Francia, etc.
    '+44', '+49', '+39', '+1', // UK, Alemania, Italia, USA/Canadá
  ];

  for (const code of knownCodes) {
    if (phoneNumber.startsWith(code)) {
      return code;
    }
  }

  // Fallback: tomar los primeros 3 caracteres (+XX) si no se reconoce
  const fallbackMatch = phoneNumber.match(/^(\+\d{1,3})/);
  return fallbackMatch ? fallbackMatch[1] : '+58';
}

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
  telefonoCelular: '+58', // Valor inicial con código de país
  correoElectronico: '',
  estadoCivil: '',
  concubinato: '',
  nacionalidad: 'V', // Por defecto venezolano cuando el tipo es 'V'
  idEstado: '',
  numMunicipio: '',
  numParroquia: '',
  direccionHabitacion: '',
  tipoVivienda: '',
  cantHabitaciones: '',
  cantBanos: '',
  materialPiso: '',
  materialParedes: '',
  materialTecho: '',
  aguaPotable: '',
  eliminacionAguasN: '',
  aseo: '',
  artefactosDomesticos: [],
  cantPersonas: '',
  cantTrabajadores: '',
  cantNinos: '',
  cantNinosEstudiando: '',
  jefeHogar: '',
  tipoEducativo: '',
  numeroEducativo: '',
  nivelEducativo: '',
  tipoTiempoEstudioJefe: '',
  tiempoEstudioJefe: '',
  ingresosMensuales: '',
  tipoEducativoSolicitante: '',
  numeroEducativoSolicitante: '',
  nivelEducativoSolicitante: '',
  tipoTiempoEstudioSolicitante: '',
  tiempoEstudioSolicitante: '',
  trabaja: '',
  condicionTrabajo: '',
  buscandoTrabajo: '',
  condicionActividad: '',
});

const STORAGE_KEY = 'applicant_form_data';
const STORAGE_STEP_KEY = 'applicant_form_current_step';

// Función para cargar datos del localStorage
const loadFormDataFromStorage = (): FormData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as FormData;
    }
  } catch (error) {
    console.error('Error al cargar datos del formulario desde localStorage:', error);
  }
  return null;
};

// Función para cargar el paso actual del localStorage
const loadCurrentStepFromStorage = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(STORAGE_STEP_KEY);
    if (stored) {
      const step = parseInt(stored, 10);
      return isNaN(step) ? 0 : Math.max(0, Math.min(step, STEPS.length - 1));
    }
  } catch (error) {
    console.error('Error al cargar el paso actual desde localStorage:', error);
  }
  return 0;
};

// Función para guardar datos en localStorage
const saveFormDataToStorage = (data: FormData) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error al guardar datos del formulario en localStorage:', error);
  }
};

// Función para guardar el paso actual en localStorage
const saveCurrentStepToStorage = (step: number) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_STEP_KEY, step.toString());
  } catch (error) {
    console.error('Error al guardar el paso actual en localStorage:', error);
  }
};

// Función para limpiar datos del localStorage
const clearFormDataFromStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_STEP_KEY);
  } catch (error) {
    console.error('Error al limpiar datos del formulario de localStorage:', error);
  }
};

// Helper para normalizar números de teléfono al formato con guión para el input
// Entrada puede ser: "+58-4122727981", "+584122727981", "0412-2727981", "04122727981"
// Salida siempre: "+58-4122727981" (con guión para visualizar)
const normalizePhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '+58-';

  // Eliminar espacios y paréntesis
  let cleaned = phone.replace(/[\s()]/g, '');

  // Si tiene formato con guión después del código (+58-...), mantenerlo
  const dashMatch = cleaned.match(/^(\+\d{1,4})-(.*)$/);
  if (dashMatch) {
    const code = dashMatch[1];
    const number = dashMatch[2].replace(/\D/g, '').replace(/^0+/, '');
    return `${code}-${number}`;
  }

  // Eliminar guiones restantes
  cleaned = cleaned.replace(/-/g, '');

  // Si ya tiene formato internacional sin guión, agregar el guión
  if (cleaned.startsWith('+')) {
    const codeMatch = cleaned.match(/^(\+\d{1,4})/);
    if (codeMatch) {
      const code = codeMatch[1];
      const number = cleaned.substring(code.length).replace(/^0+/, '');
      return `${code}-${number}`;
    }
    return cleaned;
  }

  // Si empieza con 0 y luego 4 (formato venezolano local: 0412, 0414, etc.)
  if (cleaned.startsWith('0') && cleaned.length >= 2 && cleaned[1] === '4') {
    // Convertir a formato internacional: 0412... -> +58-412...
    return '+58-' + cleaned.substring(1);
  }

  // Si solo es un número que empieza con 4 (sin el 0 inicial)
  if (cleaned.startsWith('4') && cleaned.length >= 10) {
    return '+58-' + cleaned;
  }

  // Por defecto, asumir que es venezolano
  return '+58-' + cleaned.replace(/^0+/, '');
};

// Helper para formatear el teléfono para guardar en BD (con guión)
// Entrada: "+584122727981" -> Salida: "+58-4122727981"
const formatPhoneForStorage = (phone: string): string => {
  if (!phone) return '';

  const codeMatch = phone.match(/^(\+\d{1,4})/);
  if (codeMatch) {
    const code = codeMatch[1];
    const number = phone.slice(code.length).replace(/\D/g, '');
    return `${code}-${number}`;
  }

  return phone;
};

// Helper para mapear datos iniciales a FormData
const mapInitialDataToFormData = (data: any): FormData => {
  const cedulaParts = (data.cedula || '').split('-');
  let cedulaTipo = 'V';
  let cedulaNumero = '';

  if (cedulaParts.length > 1) {
    cedulaTipo = cedulaParts[0];
    cedulaNumero = cedulaParts[1];
  } else {
    cedulaNumero = data.cedula || '';
  }

  // Determine work status
  let trabaja = 'no';
  let condicionTrabajo = '';
  let buscandoTrabajo = 'no';
  let condicionActividad = '';

  if (data.id_trabajo && data.nombre_trabajo && data.nombre_trabajo !== 'No trabaja') {
    trabaja = 'si';
    condicionTrabajo = data.nombre_trabajo;
  } else {
    trabaja = 'no';
    if (data.nombre_actividad === 'Buscando Trabajo' || data.id_actividad === 0) {
      buscandoTrabajo = 'si';
    } else if (data.nombre_actividad) {
      buscandoTrabajo = 'no';
      condicionActividad = data.nombre_actividad;
    }
  }

  return {
    cedulaTipo,
    cedulaNumero,
    nombres: data.nombres || '',
    apellidos: data.apellidos || '',
    fechaNacimiento: data.fecha_nacimiento ? (typeof data.fecha_nacimiento === 'string' ? data.fecha_nacimiento : new Date(data.fecha_nacimiento).toISOString().split('T')[0]) : '',
    sexo: data.sexo || '',
    telefonoLocal: data.telefono_local || '',
    telefonoCelular: normalizePhoneNumber(data.telefono_celular),
    correoElectronico: data.correo_electronico || '',
    estadoCivil: data.estado_civil || '',
    concubinato: data.concubinato ? 'si' : 'no',
    nacionalidad: data.nacionalidad || 'V',

    idEstado: (data.id_estado || '').toString(),
    numMunicipio: (data.num_municipio || '').toString(),
    numParroquia: (data.num_parroquia || '').toString(),
    direccionHabitacion: data.direccion_habitacion || '',

    tipoVivienda: data.tipo_vivienda || '',
    cantHabitaciones: (data.cant_habitaciones || '').toString(),
    cantBanos: (data.cant_banos || '').toString(),
    materialPiso: data.material_piso || '',
    materialParedes: data.material_paredes || '',
    materialTecho: data.material_techo || '',
    aguaPotable: data.agua_potable || '',
    eliminacionAguasN: data.eliminacion_aguas_n || '',
    aseo: data.aseo || '',
    artefactosDomesticos: Array.isArray(data.artefactos_domesticos) ? data.artefactos_domesticos : [],

    cantPersonas: (data.cant_personas || '').toString(),
    cantTrabajadores: (data.cant_trabajadores || '').toString(),
    cantNinos: (data.cant_ninos || '').toString(),
    cantNinosEstudiando: (data.cant_ninos_estudiando || '').toString(),
    jefeHogar: data.jefe_hogar ? 'si' : 'no',

    // Jefe logic
    tipoEducativo: '',
    numeroEducativo: '',
    nivelEducativo: data.nivel_educativo_jefe || '',
    tipoTiempoEstudioJefe: data.tipo_tiempo_estudio_jefe || '',
    tiempoEstudioJefe: (data.tiempo_estudio_jefe || '').toString(),
    ingresosMensuales: (data.ingresos_mensuales || '').toString(),

    // Solicitante Education
    tipoEducativoSolicitante: '',
    numeroEducativoSolicitante: '',
    nivelEducativoSolicitante: data.nivel_educativo || '',
    tipoTiempoEstudioSolicitante: data.tipo_tiempo_estudio || '',
    tiempoEstudioSolicitante: (data.tiempo_estudio || '').toString(),

    trabaja,
    condicionTrabajo,
    buscandoTrabajo,
    condicionActividad,
  };
};

export default function ApplicantFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ApplicantFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Cargar el paso actual desde localStorage (solo en modo creación)
  const [currentStep, setCurrentStep] = useState(0);
  const [shouldClearOnClose, setShouldClearOnClose] = useState(false);
  const [initialFormState, setInitialFormState] = useState<FormData | null>(null);
  // Estado interno para rastrear si estamos en modo edición
  // Esto persiste durante toda la sesión del modal, a diferencia de la prop initialData
  const [isEditMode, setIsEditMode] = useState(false);

  // Cargar datos guardados o usar datos iniciales
  const [formData, setFormData] = useState<FormData>(() => {
    if (initialData) {
      return mapInitialDataToFormData(initialData);
    }
    const stored = loadFormDataFromStorage();
    return stored || getInitialFormData();
  });

  // Efecto para actualizar cuando initialData cambia o el modal se abre/cierra
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Modo edición: usar los datos del solicitante existente
        // NO limpiamos localStorage para preservar datos de registro incompleto
        const mappedData = mapInitialDataToFormData(initialData);
        setFormData(mappedData);
        setInitialFormState(mappedData);
        setCurrentStep(0); // Empezar desde el primer paso al editar
        setIsEditMode(true); // Marcar que estamos en modo edición
      } else {
        // Modo creación: intentar cargar de localStorage o usar default
        const stored = loadFormDataFromStorage();
        const storedStep = loadCurrentStepFromStorage();
        setFormData(stored || getInitialFormData());
        setCurrentStep(storedStep);
        setInitialFormState(null);
        setIsEditMode(false); // Marcar que estamos en modo creación
      }
    } else {
      // Cuando el modal se cierra, resetear el modo de edición
      setIsEditMode(false);
    }
  }, [isOpen, initialData]);

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [cedulaCheckTimeout, setCedulaCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Estados para recomendaciones de cédula
  const [cedulaSuggestions, setCedulaSuggestions] = useState<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento?: string | null;
    telefono_celular?: string | null;
    correo_electronico?: string;
    sexo?: string;
    nacionalidad?: string;
    nombre_completo: string;
    source?: 'usuario' | 'beneficiario';
  }>>([]);
  const [showCedulaSuggestions, setShowCedulaSuggestions] = useState(false);
  const [cedulaDropdownPosition, setCedulaDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const cedulaInputRef = useRef<HTMLDivElement>(null);
  const cedulaSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Estado para controlar qué campos están bloqueados (autocompletados)
  const [lockedFields, setLockedFields] = useState<Set<keyof FormData>>(new Set());

  // Estados para catálogos
  const [condicionesTrabajo, setCondicionesTrabajo] = useState<Array<{ id_trabajo: number; nombre_trabajo: string; habilitado?: boolean }>>([]);
  const [condicionesActividad, setCondicionesActividad] = useState<Array<{ id_actividad: number; nombre_actividad: string; habilitado?: boolean }>>([]);
  const [tiposVivienda, setTiposVivienda] = useState<Array<{ num_caracteristica: number; descripcion: string; habilitado?: boolean }>>([]);
  const [materialesPiso, setMaterialesPiso] = useState<Array<{ num_caracteristica: number; descripcion: string; habilitado?: boolean }>>([]);
  const [materialesParedes, setMaterialesParedes] = useState<Array<{ num_caracteristica: number; descripcion: string; habilitado?: boolean }>>([]);
  const [materialesTecho, setMaterialesTecho] = useState<Array<{ num_caracteristica: number; descripcion: string; habilitado?: boolean }>>([]);
  const [aguaPotable, setAguaPotable] = useState<Array<{ num_caracteristica: number; descripcion: string; habilitado?: boolean }>>([]);
  const [aseo, setAseo] = useState<Array<{ num_caracteristica: number; descripcion: string; habilitado?: boolean }>>([]);
  const [eliminacionAguasN, setEliminacionAguasN] = useState<Array<{ num_caracteristica: number; descripcion: string; habilitado?: boolean }>>([]);
  const [artefactosDomesticos, setArtefactosDomesticos] = useState<Array<{ num_caracteristica: number; descripcion: string; habilitado?: boolean }>>([]);
  const [nivelesEducativos, setNivelesEducativos] = useState<Array<{ id_nivel_educativo: number; descripcion: string; habilitado?: boolean }>>([]);
  const [estados, setEstados] = useState<Array<{ id_estado: number; nombre_estado: string; habilitado?: boolean }>>([]);
  const [municipios, setMunicipios] = useState<Array<{ id_estado: number; num_municipio: number; nombre_municipio: string; habilitado?: boolean }>>([]);
  const [parroquias, setParroquias] = useState<Array<{ id_estado: number; num_municipio: number; num_parroquia: number; nombre_parroquia: string; habilitado?: boolean }>>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

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
        tipoTiempoEstudioSolicitante: '',
        tiempoEstudioSolicitante: '',
      }));
      clearErrors(['tipoTiempoEstudioSolicitante', 'tiempoEstudioSolicitante']);
    } else {
      setFormData((prev) => ({
        ...prev,
        tipoTiempoEstudioJefe: '',
        tiempoEstudioJefe: '',
      }));
      clearErrors(['tipoTiempoEstudioJefe', 'tiempoEstudioJefe']);
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
    } else {
      // Validar que no sea fecha futura
      const [year, month, day] = formData.fechaNacimiento.split('-').map(Number);
      const inputDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (inputDate > today) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento no puede ser una fecha futura';
      }
    }

    // Validar sexo
    if (!formData.sexo || formData.sexo.trim() === '') {
      newErrors.sexo = 'Este campo es requerido';
    }

    // Validar teléfono celular
    // Nota: el valor esperado es "<codigoPais>-<numero>", ej: "+58-4143714004".
    const phoneValue = (formData.telefonoCelular || '').trim();
    // Extraer código y número considerando el guión
    const dashMatch = phoneValue.match(/^(\+\d{1,4})-(.*)$/);
    let code = '';
    let number = '';
    if (dashMatch) {
      code = dashMatch[1];
      number = dashMatch[2].replace(/\D/g, '');
    } else {
      const codeMatch = phoneValue.match(/^(\+\d{1,4})/);
      code = codeMatch ? codeMatch[1] : '';
      number = phoneValue.slice(code.length).replace(/\D/g, '');
    }

    if (!phoneValue || !code || number.trim() === '') {
      newErrors.telefonoCelular = 'Este campo es requerido';
    } else if (code === '+58') {
      // Para números venezolanos (+58), el número debe tener 10 dígitos y empezar con 4.
      if (number.length !== 10 || !number.startsWith('4')) {
        newErrors.telefonoCelular = 'Número venezolano inválido. Debe tener 10 dígitos y empezar con 4 (ej: 412...).';
      }
    } else {
      // Para otros países, validar longitud mínima y máxima
      if (number.length < 7 || number.length > 15) {
        newErrors.telefonoCelular = 'Número de teléfono inválido';
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
        } else if (telefonoLocalLength > 11) {
          newErrors.telefonoLocal = 'El teléfono local no puede tener más de 11 dígitos';
        }
      }
    }

    // Validar correo electrónico
    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = 'Este campo es requerido';
    } else if (!validateEmailFormat(formData.correoElectronico)) {
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
      } else if (!['V', 'E'].includes(formData.nacionalidad)) {
        newErrors.nacionalidad = 'Nacionalidad inválida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepUbicacion = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Validar estado
    if (!formData.idEstado || formData.idEstado.trim() === '') {
      newErrors.idEstado = 'Este campo es requerido';
    }

    // Validar municipio
    if (!formData.numMunicipio || formData.numMunicipio.trim() === '') {
      newErrors.numMunicipio = 'Este campo es requerido';
    }

    // Validar parroquia
    if (!formData.numParroquia || formData.numParroquia.trim() === '') {
      newErrors.numParroquia = 'Este campo es requerido';
    }

    // Validar dirección de habitación
    if (!formData.direccionHabitacion || formData.direccionHabitacion.trim() === '') {
      newErrors.direccionHabitacion = 'Este campo es requerido';
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
      if (!formData.nivelEducativo || formData.nivelEducativo.trim() === '') {
        newErrors.nivelEducativo = 'Este campo es requerido';
      }
      // Solo validar tipo y tiempo de estudio si el nivel es técnico o universitario
      if (formData.nivelEducativo && (formData.nivelEducativo.includes('Técnico') || formData.nivelEducativo.includes('Universitaria'))) {
        if (!formData.tipoTiempoEstudioJefe || formData.tipoTiempoEstudioJefe.trim() === '') {
          newErrors.tipoTiempoEstudioJefe = 'Este campo es requerido';
        }
        if (!formData.tiempoEstudioJefe || formData.tiempoEstudioJefe.trim() === '') {
          newErrors.tiempoEstudioJefe = 'Este campo es requerido';
        } else {
          const tiempoValue = Number(formData.tiempoEstudioJefe);
          if (isNaN(tiempoValue) || tiempoValue < 0) {
            newErrors.tiempoEstudioJefe = 'Debe ser un número válido mayor o igual a 0';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Validar nivel educativo del solicitante
    if (!formData.nivelEducativoSolicitante || formData.nivelEducativoSolicitante.trim() === '') {
      newErrors.nivelEducativoSolicitante = 'Este campo es requerido';
    }

    // Solo validar tipo y tiempo de estudio si el nivel es técnico o universitario
    if (formData.nivelEducativoSolicitante && (formData.nivelEducativoSolicitante.includes('Técnico') || formData.nivelEducativoSolicitante.includes('Universitaria'))) {
      if (!formData.tipoTiempoEstudioSolicitante || formData.tipoTiempoEstudioSolicitante.trim() === '') {
        newErrors.tipoTiempoEstudioSolicitante = 'Este campo es requerido';
      }
      if (!formData.tiempoEstudioSolicitante || formData.tiempoEstudioSolicitante.trim() === '') {
        newErrors.tiempoEstudioSolicitante = 'Este campo es requerido';
      } else {
        const tiempoValue = Number(formData.tiempoEstudioSolicitante);
        if (isNaN(tiempoValue) || tiempoValue < 0) {
          newErrors.tiempoEstudioSolicitante = 'Debe ser un número válido mayor o igual a 0';
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
    // Paso 1: Ubicación
    if (currentStep === 1) {
      const isValid = validateStepUbicacion();
      if (!isValid) {
        // No avanzar si hay errores de validación
        return;
      }
    }
    // Paso 2: Nivel Educativo del Solicitante
    if (currentStep === 2) {
      const isValid = validateStep4();
      if (!isValid) {
        // No avanzar si hay errores de validación
        return;
      }
    }
    // Paso 3: Trabajo
    if (currentStep === 3) {
      const isValid = validateStep5();
      if (!isValid) {
        // No avanzar si hay errores de validación
        return;
      }
    }
    // Paso 4: Vivienda
    if (currentStep === 4) {
      const isValid = validateStep2();
      if (!isValid) {
        // No avanzar si hay errores de validación
        return;
      }
    }
    // Paso 5: Familia y Hogar
    if (currentStep === 5) {
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
      // Validar el paso 5 (Familia y Hogar) antes de enviar
      const isValid = validateStep3();
      if (!isValid) {
        // No enviar si hay errores de validación
        return;
      }

      // Verificar si hay cambios antes de enviar (solo en modo edición)
      if (initialData && initialFormState) {
        const sortArray = (arr: any) => Array.isArray(arr) ? [...arr].sort() : arr;

        const currentCheck = {
          ...formData,
          artefactosDomesticos: sortArray(formData.artefactosDomesticos)
        };
        const initialCheck = {
          ...initialFormState,
          artefactosDomesticos: sortArray(initialFormState.artefactosDomesticos)
        };

        if (JSON.stringify(currentCheck) === JSON.stringify(initialCheck)) {
          toast.info('No se han detectado cambios en la información.', 'Sin cambios');
          handleClose();
          return;
        }
      }

      try {
        setIsSubmitting(true);
        let result;
        if (initialData) {
          const { updateSolicitanteAction } = await import('@/app/actions/solicitantes');
          result = await updateSolicitanteAction(initialData.cedula, formData);
        } else {
          const { createSolicitanteAction } = await import('@/app/actions/solicitantes');
          result = await createSolicitanteAction(formData);
        }

        if (!result.success) {
          const errorCode = result.error?.code;
          const errorMessage = result.error?.message || 'Error al registrar solicitante';

          // Si es un error de correo duplicado, mostrarlo en el campo correspondiente
          if (errorCode === 'EMAIL_DUPLICADO' || errorMessage.includes('correo electrónico') || errorMessage.includes('ya está asociado')) {
            setErrors((prev) => ({
              ...prev,
              correoElectronico: errorMessage,
            }));
            // Ir al paso 1 donde está el campo de correo
            setCurrentStep(0);
            return;
          }

          throw new Error(errorMessage);
        }

        // Llamar al callback de éxito (recarga la lista y maneja el modal de confirmación)
        // El componente padre ahora maneja el modal de confirmación
        // Marcar que se debe limpiar el formulario cuando el modal se cierre
        setShouldClearOnClose(true);
        onSubmit(result);
      } catch (error: any) {
        const errorMessage = error?.message || 'Error al registrar solicitante. Por favor, intente nuevamente.';

        // Si el error contiene información sobre correo duplicado, mostrarlo en el campo
        if (errorMessage.includes('correo electrónico') || errorMessage.includes('ya está asociado')) {
          setErrors((prev) => ({
            ...prev,
            correoElectronico: errorMessage,
          }));
          setCurrentStep(0);
        } else {
          toast.error(errorMessage, 'Error de registro');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cedulaInputRef.current && !cedulaInputRef.current.contains(event.target as Node)) {
        setShowCedulaSuggestions(false);
        setCedulaDropdownPosition(null);
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


  // Cargar municipios y parroquias cuando se cargan datos desde localStorage
  useEffect(() => {
    const loadLocationData = async () => {
      if (formData.idEstado) {
        try {
          const { getMunicipiosAction } = await import('@/app/actions/ubicacion');
          const result = await getMunicipiosAction(parseInt(formData.idEstado));
          if (result.success && result.data) {
            setMunicipios(result.data);

            // Si hay un municipio guardado, cargar las parroquias
            if (formData.numMunicipio) {
              const { getParroquiasAction } = await import('@/app/actions/ubicacion');
              const parroquiasResult = await getParroquiasAction(parseInt(formData.idEstado), parseInt(formData.numMunicipio));
              if (parroquiasResult.success && parroquiasResult.data) {
                setParroquias(parroquiasResult.data);
              }
            }
          }
        } catch (error) {
          console.error('Error al cargar datos de ubicación:', error);
        }
      }
    };

    // Solo cargar si el modal está abierto y hay datos de estado
    if (isOpen && formData.idEstado) {
      loadLocationData();
    }
  }, [isOpen, formData.idEstado, formData.numMunicipio]);

  // Guardar datos en localStorage cada vez que formData cambie, pero SOLO si estamos en modo creación
  useEffect(() => {
    // Solo guardar si el modal está abierto, no estamos en modo edición, y hay datos
    if (isOpen && formData && !isEditMode) {
      saveFormDataToStorage(formData);
    }
  }, [formData, isOpen, isEditMode]);

  // Guardar el paso actual en localStorage cada vez que cambie, pero SOLO si estamos en modo creación
  useEffect(() => {
    if (isOpen && !isEditMode) {
      saveCurrentStepToStorage(currentStep);
    }
  }, [currentStep, isOpen, isEditMode]);

  // Limpiar el formulario solo cuando el modal se cierra después de un registro exitoso
  useEffect(() => {
    if (!isOpen && shouldClearOnClose) {
      // Limpiar el formulario solo cuando el modal se cierra después de un registro exitoso
      const initialData = getInitialFormData();
      setFormData(initialData);
      clearFormDataFromStorage(); // Limpiar localStorage
      setErrors({});
      setCurrentStep(0);
      setLockedFields(new Set());
      setCedulaSuggestions([]);
      setShowCedulaSuggestions(false);
      setCedulaDropdownPosition(null);
      setShouldClearOnClose(false); // Resetear el flag
    }
  }, [isOpen, shouldClearOnClose]);

  // Cargar catálogos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const loadCatalogos = async () => {
        try {
          setLoadingCatalogos(true);
          const { getCondicionTrabajoAction } = await import('@/app/actions/condicion-trabajo');
          const { getCondicionActividadAction } = await import('@/app/actions/condicion-actividad');
          const { getCaracteristicasByTipoAction } = await import('@/app/actions/caracteristicas');
          const { getNivelesEducativosAction } = await import('@/app/actions/niveles-educativos');

          const [
            trabajoResult,
            actividadResult,
            tipoViviendaResult,
            materialPisoResult,
            materialParedesResult,
            materialTechoResult,
            aguaPotableResult,
            aseoResult,
            eliminacionAguasNResult,
            artefactosDomesticosResult,
            nivelesEducativosResult,
            estadosResult,
          ] = await Promise.all([
            getCondicionTrabajoAction(),
            getCondicionActividadAction(),
            getCaracteristicasByTipoAction(1), // tipo_vivienda
            getCaracteristicasByTipoAction(2), // material_piso
            getCaracteristicasByTipoAction(3), // material_paredes
            getCaracteristicasByTipoAction(4), // material_techo
            getCaracteristicasByTipoAction(5), // agua_potable
            getCaracteristicasByTipoAction(6), // aseo
            getCaracteristicasByTipoAction(7), // eliminacion_aguas_n
            getCaracteristicasByTipoAction(8), // artefactos_domesticos
            getNivelesEducativosAction(),
            (async () => {
              const { getEstadosAction } = await import('@/app/actions/ubicacion');
              return getEstadosAction();
            })(),
          ]);

          if (trabajoResult.success && trabajoResult.data) {
            setCondicionesTrabajo(trabajoResult.data);
          }

          if (actividadResult.success && actividadResult.data) {
            setCondicionesActividad(actividadResult.data);
          }

          if (tipoViviendaResult.success && tipoViviendaResult.data) {
            setTiposVivienda(tipoViviendaResult.data);
            console.log('Tipos de vivienda cargados:', tipoViviendaResult.data);
          } else {
            console.error('Error al cargar tipos de vivienda:', tipoViviendaResult.error);
          }

          if (materialPisoResult.success && materialPisoResult.data) {
            setMaterialesPiso(materialPisoResult.data);
          } else {
            console.error('Error al cargar materiales de piso:', materialPisoResult.error);
          }

          if (materialParedesResult.success && materialParedesResult.data) {
            setMaterialesParedes(materialParedesResult.data);
          } else {
            console.error('Error al cargar materiales de paredes:', materialParedesResult.error);
          }

          if (materialTechoResult.success && materialTechoResult.data) {
            setMaterialesTecho(materialTechoResult.data);
          } else {
            console.error('Error al cargar materiales de techo:', materialTechoResult.error);
          }

          if (aguaPotableResult.success && aguaPotableResult.data) {
            setAguaPotable(aguaPotableResult.data);
          } else {
            console.error('Error al cargar agua potable:', aguaPotableResult.error);
          }

          if (aseoResult.success && aseoResult.data) {
            setAseo(aseoResult.data);
          } else {
            console.error('Error al cargar aseo:', aseoResult.error);
          }

          if (eliminacionAguasNResult.success && eliminacionAguasNResult.data) {
            setEliminacionAguasN(eliminacionAguasNResult.data);
          } else {
            console.error('Error al cargar eliminación de aguas negras:', eliminacionAguasNResult.error);
          }

          if (artefactosDomesticosResult.success && artefactosDomesticosResult.data) {
            setArtefactosDomesticos(artefactosDomesticosResult.data);
          } else {
            console.error('Error al cargar artefactos domésticos:', artefactosDomesticosResult.error);
          }

          if (nivelesEducativosResult.success && nivelesEducativosResult.data) {
            setNivelesEducativos(nivelesEducativosResult.data);
          } else {
            console.error('Error al cargar niveles educativos:', nivelesEducativosResult.error);
          }

          if (estadosResult.success && estadosResult.data) {
            setEstados(estadosResult.data);
          } else {
            console.error('Error al cargar estados:', estadosResult.error);
          }
        } catch (error) {
          console.error('Error al cargar catálogos:', error);
        } finally {
          setLoadingCatalogos(false);
        }
      };

      loadCatalogos();
    }
  }, [isOpen]);

  // Efecto para actualizar posición del dropdown cuando hay scroll, resize o cambios en errores
  useEffect(() => {
    if (showCedulaSuggestions && cedulaInputRef.current) {
      const updatePosition = () => {
        if (cedulaInputRef.current) {
          const container = cedulaInputRef.current;

          // Buscar el InputGroup dentro del contenedor
          const inputGroup = container.querySelector('div.flex.flex-col.gap-1');

          // Buscar el mensaje de error dentro del InputGroup
          let targetElement: Element = container;
          if (inputGroup) {
            const errorMessage = inputGroup.querySelector('p.text-danger');
            // Si hay mensaje de error, usar su posición, si no, usar el InputGroup completo
            if (errorMessage) {
              targetElement = errorMessage;
            } else {
              // Buscar el contenedor del input (div.flex.items-center.gap-2)
              const inputContainer = inputGroup.querySelector('div.flex.items-center.gap-2');
              if (inputContainer) {
                targetElement = inputContainer;
              } else {
                targetElement = inputGroup;
              }
            }
          }

          const rect = targetElement.getBoundingClientRect();
          setCedulaDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      // Actualizar posición inmediatamente
      updatePosition();

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      // Observar cambios en el DOM para detectar cuando aparece/desaparece el mensaje de error
      const observer = new MutationObserver(updatePosition);
      if (cedulaInputRef.current) {
        observer.observe(cedulaInputRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style'],
        });
      }

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        observer.disconnect();
      };
    }
  }, [showCedulaSuggestions, errors.cedulaNumero]);

  const handleClose = () => {
    // Limpiar timeouts al cerrar
    if (cedulaCheckTimeout) {
      clearTimeout(cedulaCheckTimeout);
      setCedulaCheckTimeout(null);
    }

    // NO limpiar el formulario aquí - los datos deben persistir
    // Solo cerrar el modal
    onClose();
  };

  const handleClearForm = () => {
    // Limpiar todo el formulario y volver al principio
    const initialData = getInitialFormData();
    setFormData(initialData);
    clearFormDataFromStorage(); // Limpiar localStorage
    setErrors({});
    setCurrentStep(0);
    setLockedFields(new Set());
    setCedulaSuggestions([]);
    setShowCedulaSuggestions(false);
    setCedulaDropdownPosition(null);
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
        telefonoCelular: '+58',
        correoElectronico: '',
        nacionalidad: '',
        [field]: value, // Actualizar el campo que se está modificando
      }));
      // Desbloquear todos los campos
      setLockedFields(new Set());
      // Limpiar sugerencias
      setCedulaSuggestions([]);
      setShowCedulaSuggestions(false);
      setCedulaDropdownPosition(null);
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
        nacionalidadAsignada = 'E'; // Extranjero (el schema usa 'E')
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
    } else if (field === 'telefonoLocal') {
      filteredValue = filterOnlyNumbers(value);
    } else if (field === 'telefonoCelular') {
      // Siempre asegurar que el código de país esté presente y empiece con '+'
      const code = value.startsWith('+') ? extractCountryCode(value) : '+58';
      // Permitimos el 0 temporalmente para advertir al usuario
      const number = value.startsWith('+') ? value.slice(code.length).replace(/\D/g, '') : value.replace(/\D/g, '');
      // SIEMPRE CON EL GUIÓN: +CODE-NUMBER
      filteredValue = `${code}-${number}`;
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

    // Validar formato de teléfono celular en tiempo real
    if (field === 'telefonoCelular') {
      const phoneValue = filteredValue.trim();
      // Extraer código y número considerando el guión
      const dashMatch = phoneValue.match(/^(\+\d{1,4})-(.*)$/);
      let code = '';
      let number = '';
      if (dashMatch) {
        code = dashMatch[1];
        number = dashMatch[2].replace(/\D/g, '');
      } else {
        code = extractCountryCode(phoneValue);
        number = phoneValue.slice(code.length).replace(/\D/g, '');
      }

      // Solo validar si hay un número ingresado (no solo el código)
      if (number.length > 0) {
        // Advertencia de 0 al inicio
        if (number.startsWith('0')) {
          setErrors((prev) => ({
            ...prev,
            telefonoCelular: 'No debe colocar el cero al inicio.',
          }));
        } else if (code === '+58') {
          // Para números venezolanos (+58), el número debe tener 10 dígitos y empezar con 4
          if (number.length === 10 && !number.startsWith('4')) {
            setErrors((prev) => ({
              ...prev,
              telefonoCelular: 'Número venezolano inválido. Debe empezar con 4 (ej: 412...)',
            }));
          } else if (number.length > 10) {
            setErrors((prev) => ({
              ...prev,
              telefonoCelular: 'Número venezolano inválido. Debe tener 10 dígitos.',
            }));
          }
        } else if (code && number.length > 15) {
          setErrors((prev) => ({
            ...prev,
            telefonoCelular: 'Número de teléfono inválido. Máximo 15 dígitos.',
          }));
        }
      }
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
      setCedulaDropdownPosition(null);
      return;
    }

    // Construir cédula con formato V-XXXX (con guión)
    const cedula = `${cedulaTipo}-${cedulaNumero}`;

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
          setCedulaDropdownPosition(null);
          return; // No buscar recomendaciones si es solicitante
        }
      }

      // Si no es solicitante, buscar en usuarios y beneficiarios para autocompletar
      // Si hay una coincidencia exacta, autocompletar automáticamente
      if (cedulaNumero.trim().length >= 4) {
        // Buscar en usuarios
        const { getUsuarioCompleteByCedulaAction } = await import('@/app/actions/usuarios');
        const usuarioResult = await getUsuarioCompleteByCedulaAction(cedula);

        if (usuarioResult.success && usuarioResult.data) {
          autocompleteFromUsuario(usuarioResult.data);
          return;
        }

        // Buscar en beneficiarios
        const { getBeneficiarioByCedulaAction } = await import('@/app/actions/beneficiarios');
        const beneficiarioResult = await getBeneficiarioByCedulaAction(cedula);

        if (beneficiarioResult.success && beneficiarioResult.data) {
          autocompleteFromBeneficiario({
            ...beneficiarioResult.data,
            sexo: beneficiarioResult.data.sexo ?? undefined,
          });
          return;
        }
      }

      // Si no hay coincidencia exacta, buscar recomendaciones de usuarios del sistema
      // Permitir búsqueda con 1 carácter o más
      if (cedulaNumero.trim().length >= 1) {
        if (cedulaSearchTimeout.current) {
          clearTimeout(cedulaSearchTimeout.current);
        }

        cedulaSearchTimeout.current = setTimeout(async () => {
          try {
            const { searchUsuariosAction } = await import('@/app/actions/solicitantes');
            const { searchBeneficiariosByCedulaAction } = await import('@/app/actions/beneficiarios');

            const [usuariosResult, beneficiariosResult] = await Promise.all([
              searchUsuariosAction(cedula, true),
              searchBeneficiariosByCedulaAction(cedula),
            ]);

            // Combinar resultados de usuarios y beneficiarios
            const allSuggestions: any[] = [];

            if (usuariosResult.success && usuariosResult.data) {
              const formattedUsuarios = usuariosResult.data.map((c: any) => ({
                ...c,
                fecha_nacimiento: c.fecha_nacimiento ? new Date(c.fecha_nacimiento).toISOString().split('T')[0] : null,
                source: 'usuario',
              }));
              allSuggestions.push(...formattedUsuarios);
            }

            if (beneficiariosResult.success && beneficiariosResult.data) {
              const formattedBeneficiarios = beneficiariosResult.data.map((c: any) => ({
                ...c,
                fecha_nacimiento: c.fecha_nacimiento ? new Date(c.fecha_nacimiento).toISOString().split('T')[0] : null,
                source: 'beneficiario',
              }));
              allSuggestions.push(...formattedBeneficiarios);
            }

            setCedulaSuggestions(allSuggestions);

            // Calcular posición del dropdown usando fixed positioning
            if (cedulaInputRef.current && allSuggestions.length > 0 && !errors.cedulaNumero) {
              const container = cedulaInputRef.current;

              // Buscar el InputGroup dentro del contenedor
              const inputGroup = container.querySelector('div.flex.flex-col.gap-1');

              // Buscar el mensaje de error dentro del InputGroup
              let targetElement: Element = container;
              if (inputGroup) {
                const errorMessage = inputGroup.querySelector('p.text-danger');
                // Si hay mensaje de error, usar su posición, si no, usar el InputGroup completo
                if (errorMessage) {
                  targetElement = errorMessage;
                } else {
                  // Buscar el contenedor del input (div.flex.items-center.gap-2)
                  const inputContainer = inputGroup.querySelector('div.flex.items-center.gap-2');
                  if (inputContainer) {
                    targetElement = inputContainer;
                  } else {
                    targetElement = inputGroup;
                  }
                }
              }

              const rect = targetElement.getBoundingClientRect();
              setCedulaDropdownPosition({
                top: rect.bottom + 4, // 4px de margen (mt-1)
                left: rect.left,
                width: rect.width,
              });
              setShowCedulaSuggestions(true);
            } else {
              setShowCedulaSuggestions(false);
              setCedulaDropdownPosition(null);
            }

            // Si hay una coincidencia exacta, autocompletar automáticamente
            const exactMatch = allSuggestions.find((c: any) => c.cedula === cedula);
            if (exactMatch) {
              if (exactMatch.source === 'usuario') {
                const { getUsuarioCompleteByCedulaAction } = await import('@/app/actions/usuarios');
                const usuarioResult = await getUsuarioCompleteByCedulaAction(cedula);
                if (usuarioResult.success && usuarioResult.data) {
                  autocompleteFromUsuario(usuarioResult.data);
                }
              } else if (exactMatch.source === 'beneficiario') {
                autocompleteFromBeneficiario({
                  ...exactMatch,
                  sexo: exactMatch.sexo ?? undefined,
                });
              }
            }
          } catch (error) {
            setCedulaSuggestions([]);
            setShowCedulaSuggestions(false);
            setCedulaDropdownPosition(null);
          }
        }, 300);
      } else {
        setCedulaSuggestions([]);
        setShowCedulaSuggestions(false);
        setCedulaDropdownPosition(null);
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
    if (!validateEmailFormat(email)) {
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
        // Verificar si ya está registrado en la BD
        const { checkEmailExistsAction } = await import('@/app/actions/solicitantes');
        // Si estamos editando, excluir la cédula actual de la verificación
        const excludeCedula = initialData?.cedula;
        const result = await checkEmailExistsAction(email, excludeCedula);

        if (result.success && result.exists) {
          // El correo ya está asociado a otro solicitante
          setErrors((prev) => ({
            ...prev,
            correoElectronico: `El correo electrónico ${email} ya está registrado para otro solicitante`,
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
    fecha_nacimiento?: string | null;
    telefono_celular?: string | null;
    correo_electronico?: string;
    sexo?: string;
    nacionalidad?: string;
    nombre_completo?: string;
    source?: 'usuario' | 'beneficiario';
  }) => {
    // Extraer tipo y número de cédula
    // La cédula viene como "V-12345678" (con guión)
    let cedulaTipo = 'V';
    let cedulaNumero = solicitante.cedula || '';

    // Si la cédula tiene formato "V-XXXX", extraer el tipo y el número
    const cedulaMatch = cedulaNumero.match(/^([VE])-?(.+)$/);
    if (cedulaMatch) {
      cedulaTipo = cedulaMatch[1];
      cedulaNumero = cedulaMatch[2]; // Ya viene sin el guión después del tipo
    } else if (cedulaNumero.match(/^[VE]/)) {
      // Fallback: si viene como "V12345678" (sin guión), extraer el tipo
      cedulaTipo = cedulaNumero[0];
      cedulaNumero = cedulaNumero.substring(1);
    }

    // Extraer código de país y número de teléfono celular
    const telefonoCompleto = solicitante.telefono_celular || '';

    // Asignar nacionalidad según el tipo de cédula
    let nacionalidadAsignada = '';
    if (cedulaTipo === 'V' || cedulaTipo === 'J') {
      nacionalidadAsignada = 'V'; // Venezolano
    } else if (cedulaTipo === 'E') {
      nacionalidadAsignada = 'E'; // Extranjero (el schema usa 'E')
    } else if (cedulaTipo === 'P') {
      nacionalidadAsignada = ''; // Si es pasaporte, usar la nacionalidad del solicitante o dejar vacío
    }

    // Actualizar el formulario con los datos del solicitante
    setFormData((prev) => ({
      ...prev,
      cedulaTipo,
      cedulaNumero,
      nombres: solicitante.nombres || prev.nombres,
      apellidos: solicitante.apellidos || prev.apellidos,
      fechaNacimiento: solicitante.fecha_nacimiento || prev.fechaNacimiento,
      sexo: solicitante.sexo || prev.sexo,
      telefonoCelular: telefonoCompleto || prev.telefonoCelular,
      correoElectronico: solicitante.correo_electronico || prev.correoElectronico,
      nacionalidad: nacionalidadAsignada || prev.nacionalidad,
    }));

    // Bloquear solo los campos que tienen datos
    const camposBloqueados = new Set<keyof FormData>();
    if (solicitante.nombres) camposBloqueados.add('nombres');
    if (solicitante.apellidos) camposBloqueados.add('apellidos');
    if (solicitante.fecha_nacimiento) camposBloqueados.add('fechaNacimiento');
    if (solicitante.sexo) camposBloqueados.add('sexo');
    if (telefonoCompleto) {
      camposBloqueados.add('telefonoCelular');
    }
    if (solicitante.correo_electronico) camposBloqueados.add('correoElectronico');
    if (nacionalidadAsignada) camposBloqueados.add('nacionalidad');

    setLockedFields(camposBloqueados);

    // Limpiar errores de todos los campos que se autocompletaron
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cedulaNumero;
      if (solicitante.nombres) delete newErrors.nombres;
      if (solicitante.apellidos) delete newErrors.apellidos;
      if (solicitante.fecha_nacimiento) delete newErrors.fechaNacimiento;
      if (solicitante.sexo) delete newErrors.sexo;
      if (telefonoCompleto) {
        delete newErrors.telefonoCelular;
      }
      if (solicitante.correo_electronico) delete newErrors.correoElectronico;
      if (nacionalidadAsignada) delete newErrors.nacionalidad;
      return newErrors;
    });
    setShowCedulaSuggestions(false);
    setCedulaSuggestions([]);
    setCedulaDropdownPosition(null);
  };

  // Función para autocompletar desde un usuario
  const autocompleteFromUsuario = (usuario: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    telefono_celular: string | null;
    nombre_completo: string;
  }) => {
    // Extraer tipo y número de cédula
    let cedulaTipo = 'V';
    let cedulaNumero = usuario.cedula || '';

    const cedulaMatch = cedulaNumero.match(/^([VE])-?(.+)$/);
    if (cedulaMatch) {
      cedulaTipo = cedulaMatch[1];
      cedulaNumero = cedulaMatch[2];
    } else if (cedulaNumero.match(/^[VE]/)) {
      cedulaTipo = cedulaNumero[0];
      cedulaNumero = cedulaNumero.substring(1);
    }

    // Extraer código de país y número de teléfono celular
    const telefonoCompleto = usuario.telefono_celular || '';

    // Asignar nacionalidad según el tipo de cédula
    let nacionalidadAsignada = '';
    if (cedulaTipo === 'V') {
      nacionalidadAsignada = 'V';
    } else if (cedulaTipo === 'E') {
      nacionalidadAsignada = 'E'; // Extranjero (el schema usa 'E')
    }

    // Actualizar el formulario con los datos del usuario
    setFormData((prev) => ({
      ...prev,
      cedulaTipo,
      cedulaNumero,
      nombres: usuario.nombres || prev.nombres,
      apellidos: usuario.apellidos || prev.apellidos,
      telefonoCelular: telefonoCompleto || prev.telefonoCelular,
      correoElectronico: usuario.correo_electronico || prev.correoElectronico,
      nacionalidad: nacionalidadAsignada || prev.nacionalidad,
    }));

    // Bloquear solo los campos que tienen datos
    const camposBloqueados = new Set<keyof FormData>();
    if (usuario.nombres) camposBloqueados.add('nombres');
    if (usuario.apellidos) camposBloqueados.add('apellidos');
    if (telefonoCompleto) {
      camposBloqueados.add('telefonoCelular');
    }
    if (usuario.correo_electronico) camposBloqueados.add('correoElectronico');
    if (nacionalidadAsignada) camposBloqueados.add('nacionalidad');

    setLockedFields(camposBloqueados);

    // Limpiar errores de todos los campos que se autocompletaron
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cedulaNumero;
      if (usuario.nombres) delete newErrors.nombres;
      if (usuario.apellidos) delete newErrors.apellidos;
      if (telefonoCompleto) {
        delete newErrors.telefonoCelular;
      }
      if (usuario.correo_electronico) delete newErrors.correoElectronico;
      if (nacionalidadAsignada) delete newErrors.nacionalidad;
      return newErrors;
    });
    setShowCedulaSuggestions(false);
    setCedulaSuggestions([]);
    setCedulaDropdownPosition(null);
  };

  // Función para autocompletar desde un beneficiario
  const autocompleteFromBeneficiario = (beneficiario: {
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento?: string | null;
    sexo?: string;
    nombre_completo: string;
  }) => {
    // Extraer tipo y número de cédula
    let cedulaTipo = 'V';
    let cedulaNumero = beneficiario.cedula || '';

    const cedulaMatch = cedulaNumero.match(/^([VE])-?(.+)$/);
    if (cedulaMatch) {
      cedulaTipo = cedulaMatch[1];
      cedulaNumero = cedulaMatch[2];
    } else if (cedulaNumero.match(/^[VE]/)) {
      cedulaTipo = cedulaNumero[0];
      cedulaNumero = cedulaNumero.substring(1);
    }

    // Asignar nacionalidad según el tipo de cédula
    let nacionalidadAsignada = '';
    if (cedulaTipo === 'V') {
      nacionalidadAsignada = 'V';
    } else if (cedulaTipo === 'E') {
      nacionalidadAsignada = 'E'; // Extranjero (el schema usa 'E')
    }

    // Actualizar el formulario with los datos del beneficiario
    setFormData((prev) => ({
      ...prev,
      cedulaTipo,
      cedulaNumero,
      nombres: beneficiario.nombres || prev.nombres,
      apellidos: beneficiario.apellidos || prev.apellidos,
      fechaNacimiento: beneficiario.fecha_nacimiento || prev.fechaNacimiento,
      sexo: beneficiario.sexo || prev.sexo,
      nacionalidad: nacionalidadAsignada || prev.nacionalidad,
    }));

    // Bloquear solo los campos que tienen datos
    const camposBloqueados = new Set<keyof FormData>();
    if (beneficiario.nombres) camposBloqueados.add('nombres');
    if (beneficiario.apellidos) camposBloqueados.add('apellidos');
    if (beneficiario.fecha_nacimiento) camposBloqueados.add('fechaNacimiento');
    if (beneficiario.sexo) camposBloqueados.add('sexo');
    if (nacionalidadAsignada) camposBloqueados.add('nacionalidad');

    setLockedFields(camposBloqueados);

    // Limpiar errores de todos los campos que se autocompletaron
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cedulaNumero;
      if (beneficiario.nombres) delete newErrors.nombres;
      if (beneficiario.apellidos) delete newErrors.apellidos;
      if (beneficiario.fecha_nacimiento) delete newErrors.fechaNacimiento;
      if (beneficiario.sexo) delete newErrors.sexo;
      if (nacionalidadAsignada) delete newErrors.nacionalidad;
      return newErrors;
    });
    setShowCedulaSuggestions(false);
    setCedulaSuggestions([]);
    setCedulaDropdownPosition(null);
  };

  const renderStep1 = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4">
      {/* Fila 1: Cédula, Nombres, Apellidos */}
      <div className="col-span-1 relative" ref={cedulaInputRef}>
        <InputGroup
          label="Cédula *"
          selectValue={formData.cedulaTipo}
          selectOptions={[
            { value: 'V', label: 'V' },
            { value: 'E', label: 'E' },
          ]}
          onSelectChange={(value) => {
            if (isEditMode) return; // No permitir cambios en modo edición
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
            if (isEditMode) return; // No permitir cambios en modo edición
            // El InputGroup ya filtra solo números si numbersOnly=true
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
          numbersOnly={true}
          inputPlaceholder="Ingrese cédula"
          error={errors.cedulaNumero}
          disabled={isEditMode}
        />
        {/* Lista de sugerencias de cédula */}
        <AnimatePresence>
          {showCedulaSuggestions && cedulaSuggestions.length > 0 && !errors.cedulaNumero && cedulaDropdownPosition && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed z-100 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              style={{
                top: `${cedulaDropdownPosition.top}px`,
                left: `${cedulaDropdownPosition.left}px`,
                width: `${cedulaDropdownPosition.width}px`,
              }}
            >
              {cedulaSuggestions.map((item, index) => (
                <motion.button
                  key={`${item.cedula}-${index}`}
                  type="button"
                  onClick={async () => {
                    if (item.source === 'usuario') {
                      const { getUsuarioCompleteByCedulaAction } = await import('@/app/actions/usuarios');
                      const usuarioResult = await getUsuarioCompleteByCedulaAction(item.cedula);
                      if (usuarioResult.success && usuarioResult.data) {
                        autocompleteFromUsuario(usuarioResult.data);
                      }
                    } else if (item.source === 'beneficiario') {
                      autocompleteFromBeneficiario({
                        ...item,
                        sexo: item.sexo ?? undefined,
                      });
                    } else {
                      // Fallback para compatibilidad con sugerencias antiguas
                      autocompleteFromSolicitante(item);
                    }
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.15 }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{item.cedula}</div>
                      <div className="text-sm text-gray-600">{item.nombre_completo}</div>
                    </div>
                    {item.source && (
                      <span className="text-xs text-gray-500 capitalize ml-2">
                        {item.source === 'usuario' ? 'Usuario' : item.source === 'beneficiario' ? 'Beneficiario' : ''}
                      </span>
                    )}
                  </div>
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
        <PhoneInput
          label="Teléfono Celular"
          name="telefonoCelular"
          value={formData.telefonoCelular}
          onChange={(e) => updateField('telefonoCelular', e.target.value)}
          placeholder="Ingrese teléfono celular"
          error={errors.telefonoCelular}
          required
          disabled={lockedFields.has('telefonoCelular')}
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
          disabled={lockedFields.has('correoElectronico')}
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
              { value: 'E', label: 'Extranjero/a' },
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

  const renderStepUbicacion = () => {
    // Cargar municipios cuando se selecciona un estado
    const handleEstadoChange = async (idEstado: string) => {
      // Actualizar estado y limpiar municipio y parroquia
      setFormData((prev) => ({
        ...prev,
        idEstado,
        numMunicipio: '',
        numParroquia: '',
      }));
      clearErrors(['numMunicipio', 'numParroquia']);

      if (idEstado) {
        try {
          const { getMunicipiosAction } = await import('@/app/actions/ubicacion');
          const result = await getMunicipiosAction(parseInt(idEstado));
          if (result.success && result.data) {
            setMunicipios(result.data);
          } else {
            setMunicipios([]);
          }
        } catch (error) {
          console.error('Error al cargar municipios:', error);
          setMunicipios([]);
        }
      } else {
        setMunicipios([]);
        setParroquias([]);
      }
    };

    // Cargar parroquias cuando se selecciona un municipio
    const handleMunicipioChange = async (numMunicipio: string) => {
      // Actualizar municipio y limpiar parroquia
      setFormData((prev) => ({
        ...prev,
        numMunicipio,
        numParroquia: '',
      }));
      clearErrors(['numParroquia']);

      if (numMunicipio && formData.idEstado) {
        try {
          const { getParroquiasAction } = await import('@/app/actions/ubicacion');
          const result = await getParroquiasAction(parseInt(formData.idEstado), parseInt(numMunicipio));
          if (result.success && result.data) {
            setParroquias(result.data);
          } else {
            setParroquias([]);
          }
        } catch (error) {
          console.error('Error al cargar parroquias:', error);
          setParroquias([]);
        }
      } else {
        setParroquias([]);
      }
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4">
        <div className="col-span-1">
          <Select
            label="Estado *"
            value={formData.idEstado}
            onChange={(e) => handleEstadoChange(e.target.value)}
            options={estados
              .filter((estado) => estado.habilitado !== false)
              .map(estado => ({
                value: estado.id_estado.toString(),
                label: estado.nombre_estado,
              }))}
            placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar estado"}
            error={errors.idEstado}
            required
            disabled={loadingCatalogos}
          />
        </div>
        <div className="col-span-1">
          <Select
            label="Municipio *"
            value={formData.numMunicipio}
            onChange={(e) => handleMunicipioChange(e.target.value)}
            options={municipios
              .filter((municipio) => municipio.habilitado !== false)
              .map(municipio => ({
                value: municipio.num_municipio.toString(),
                label: municipio.nombre_municipio,
              }))}
            placeholder={formData.idEstado ? (loadingCatalogos ? "Cargando..." : "Seleccionar municipio") : "Primero seleccione un estado"}
            error={errors.numMunicipio}
            required
            disabled={!formData.idEstado || loadingCatalogos}
          />
        </div>
        <div className="col-span-1">
          <Select
            label="Parroquia *"
            value={formData.numParroquia}
            onChange={(e) => updateField('numParroquia', e.target.value)}
            options={parroquias
              .filter((parroquia) => parroquia.habilitado !== false)
              .map(parroquia => ({
                value: parroquia.num_parroquia.toString(),
                label: parroquia.nombre_parroquia,
              }))}
            placeholder={formData.numMunicipio ? (loadingCatalogos ? "Cargando..." : "Seleccionar parroquia") : "Primero seleccione un municipio"}
            error={errors.numParroquia}
            required
            disabled={!formData.numMunicipio || loadingCatalogos}
          />
        </div>
        <div className="col-span-full">
          <Input
            label="Dirección de Habitación *"
            name="direccionHabitacion"
            value={formData.direccionHabitacion}
            onChange={(e) => updateField('direccionHabitacion', e.target.value)}
            error={errors.direccionHabitacion}
            placeholder="Indique avenida, calle, edificio, piso, apartamento..."
            required
          />
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4">
      {/* Fila 1: Tipo de Vivienda, Cantidad de Habitaciones, Cantidad de Baños */}
      <div className="col-span-1">
        <Select
          label="Tipo de Vivienda *"
          value={formData.tipoVivienda}
          onChange={(e) => updateField('tipoVivienda', e.target.value)}
          options={tiposVivienda && tiposVivienda.length > 0
            ? tiposVivienda.map(tv => ({
              value: tv.descripcion,
              label: tv.descripcion,
            }))
            : []}
          placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar tipo de vivienda"}
          error={errors.tipoVivienda}
          required
          disabled={loadingCatalogos}
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
          options={materialesPiso
            .filter((mp) => mp.habilitado !== false)
            .map(mp => ({
              value: mp.descripcion,
              label: mp.descripcion,
            }))}
          placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar material"}
          error={errors.materialPiso}
          required
          disabled={loadingCatalogos}
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Material de Paredes *"
          value={formData.materialParedes}
          onChange={(e) => updateField('materialParedes', e.target.value)}
          options={materialesParedes.map(mp => ({
            value: mp.descripcion,
            label: mp.descripcion,
          }))}
          placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar material"}
          error={errors.materialParedes}
          required
          disabled={loadingCatalogos}
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Material de Techo *"
          value={formData.materialTecho}
          onChange={(e) => updateField('materialTecho', e.target.value)}
          options={materialesTecho
            .filter((mt) => mt.habilitado !== false)
            .map(mt => ({
              value: mt.descripcion,
              label: mt.descripcion,
            }))}
          placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar material"}
          error={errors.materialTecho}
          required
          disabled={loadingCatalogos}
        />
      </div>

      {/* Fila 3: Agua Potable, Eliminación de Aguas Negras, Aseo */}
      <div className="col-span-1">
        <Select
          label="Agua Potable *"
          value={formData.aguaPotable}
          onChange={(e) => updateField('aguaPotable', e.target.value)}
          options={aguaPotable.map(ap => ({
            value: ap.descripcion,
            label: ap.descripcion,
          }))}
          placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar opción"}
          error={errors.aguaPotable}
          required
          disabled={loadingCatalogos}
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Eliminación de Aguas Negras *"
          value={formData.eliminacionAguasN}
          onChange={(e) => updateField('eliminacionAguasN', e.target.value)}
          options={eliminacionAguasN
            .filter((ean) => ean.habilitado !== false)
            .map(ean => ({
              value: ean.descripcion,
              label: ean.descripcion,
            }))}
          placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar opción"}
          error={errors.eliminacionAguasN}
          required
          disabled={loadingCatalogos}
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Aseo *"
          value={formData.aseo}
          onChange={(e) => updateField('aseo', e.target.value)}
          options={aseo
            .filter((a) => a.habilitado !== false)
            .map(a => ({
              value: a.descripcion,
              label: a.descripcion,
            }))}
          placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar opción"}
          error={errors.aseo}
          required
          disabled={loadingCatalogos}
        />
      </div>

      {/* Fila 4: Artefactos Domésticos */}
      <div className="col-span-full">
        <div className="flex flex-col gap-1">
          <label className="text-base font-normal text-foreground mb-1">
            Artefactos Domésticos
          </label>
          <div className="grid grid-cols-4 gap-x-4 gap-y-1">
            {artefactosDomesticos
              .filter((artefacto) => artefacto.habilitado !== false)
              .map((artefacto) => {
                const isChecked = formData.artefactosDomesticos.includes(artefacto.descripcion);
                return (
                  <label
                    key={artefacto.num_caracteristica}
                    className="flex items-center gap-2 cursor-pointer py-0.5 px-2 rounded-full transition-colors"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              artefactosDomesticos: [...prev.artefactosDomesticos, artefacto.descripcion],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              artefactosDomesticos: prev.artefactosDomesticos.filter(
                                (a) => a !== artefacto.descripcion
                              ),
                            }));
                          }
                        }}
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
                    <span className="text-base text-foreground">{artefacto.descripcion}</span>
                  </label>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4">
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
          label="Cantidad de Niños entre 7-12 años *"
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
                tipoTiempoEstudioJefe: '',
                tiempoEstudioJefe: '',
              }));
              clearErrors(['tipoEducativo', 'numeroEducativo', 'nivelEducativo', 'tipoTiempoEstudioJefe', 'tiempoEstudioJefe']);
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
              label="Nivel Educativo del Jefe de Hogar *"
              value={formData.nivelEducativo}
              onChange={(e) => {
                updateField('nivelEducativo', e.target.value);
                // Limpiar campos relacionados
                setFormData((prev) => ({
                  ...prev,
                  tipoEducativo: '',
                  numeroEducativo: '',
                  tipoTiempoEstudioJefe: '',
                  tiempoEstudioJefe: '',
                }));
                clearErrors(['tipoEducativo', 'numeroEducativo', 'tipoTiempoEstudioJefe', 'tiempoEstudioJefe']);
              }}
              options={nivelesEducativos
                .filter((nivel) => nivel.habilitado !== false)
                .map((nivel) => ({
                  value: nivel.descripcion,
                  label: nivel.descripcion,
                }))}
              placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar nivel educativo"}
              error={errors.nivelEducativo}
              required
              disabled={loadingCatalogos}
            />
          </div>
          {/* Solo mostrar campos de duración para niveles técnicos y universitarios */}
          {formData.nivelEducativo &&
            (formData.nivelEducativo.includes('Técnico') || formData.nivelEducativo.includes('Universitaria')) && (
              <>
                <div className="col-span-1">
                  <Select
                    label="Tipo de Tiempo del Jefe de Hogar *"
                    value={formData.tipoTiempoEstudioJefe}
                    onChange={(e) => {
                      updateField('tipoTiempoEstudioJefe', e.target.value);
                      // Limpiar tiempo de estudio cuando cambia el tipo
                      setFormData((prev) => ({
                        ...prev,
                        tiempoEstudioJefe: '',
                      }));
                      clearErrors(['tiempoEstudioJefe']);
                    }}
                    options={[
                      { value: 'Años', label: 'Años' },
                      { value: 'Semestres', label: 'Semestres' },
                      { value: 'Trimestres', label: 'Trimestres' },
                    ]}
                    placeholder="Seleccionar tipo"
                    error={errors.tipoTiempoEstudioJefe}
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    label="Tiempo de Estudio del Jefe de Hogar *"
                    type="number"
                    value={formData.tiempoEstudioJefe}
                    onChange={(e) => updateField('tiempoEstudioJefe', e.target.value)}
                    placeholder={`Ingrese ${formData.tipoTiempoEstudioJefe.toLowerCase() || 'cantidad'}`}
                    error={errors.tiempoEstudioJefe}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4">
      {/* Fila 1: Nivel Educativo */}
      <div className="col-span-1">
        <Select
          label="Nivel Educativo *"
          value={formData.nivelEducativoSolicitante}
          onChange={(e) => {
            updateField('nivelEducativoSolicitante', e.target.value);
            // Limpiar campos relacionados
            setFormData((prev) => ({
              ...prev,
              tipoEducativoSolicitante: '',
              numeroEducativoSolicitante: '',
              tipoTiempoEstudioSolicitante: '',
              tiempoEstudioSolicitante: '',
            }));
            clearErrors(['tipoEducativoSolicitante', 'numeroEducativoSolicitante', 'tipoTiempoEstudioSolicitante', 'tiempoEstudioSolicitante']);
          }}
          options={nivelesEducativos
            .filter((nivel) => nivel.habilitado !== false)
            .map((nivel) => ({
              value: nivel.descripcion,
              label: nivel.descripcion,
            }))}
          placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar nivel educativo"}
          error={errors.nivelEducativoSolicitante}
          required
          disabled={loadingCatalogos}
        />
      </div>
      {/* Solo mostrar campos de duración para niveles técnicos y universitarios */}
      {formData.nivelEducativoSolicitante &&
        (formData.nivelEducativoSolicitante.includes('Técnico') || formData.nivelEducativoSolicitante.includes('Universitaria')) && (
          <>
            <div className="col-span-1">
              <Select
                label="Tipo de Tiempo *"
                value={formData.tipoTiempoEstudioSolicitante}
                onChange={(e) => {
                  updateField('tipoTiempoEstudioSolicitante', e.target.value);
                  // Limpiar tiempo de estudio cuando cambia el tipo
                  setFormData((prev) => ({
                    ...prev,
                    tiempoEstudioSolicitante: '',
                  }));
                  clearErrors(['tiempoEstudioSolicitante']);
                }}
                options={[
                  { value: 'Años', label: 'Años' },
                  { value: 'Semestres', label: 'Semestres' },
                  { value: 'Trimestres', label: 'Trimestres' },
                ]}
                placeholder="Seleccionar tipo"
                error={errors.tipoTiempoEstudioSolicitante}
                required
              />
            </div>
            <div className="col-span-1">
              <Input
                label="Tiempo de Estudio *"
                type="number"
                value={formData.tiempoEstudioSolicitante}
                onChange={(e) => updateField('tiempoEstudioSolicitante', e.target.value)}
                placeholder={`Ingrese ${formData.tipoTiempoEstudioSolicitante.toLowerCase() || 'cantidad'}`}
                error={errors.tiempoEstudioSolicitante}
                required
                min="0"
              />
            </div>
          </>
        )}
    </div>
  );

  const renderStep5 = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4">
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
            options={condicionesTrabajo
              .filter(ct => ct.id_trabajo !== 0) // Excluir "no trabaja"
              .map(ct => ({
                value: ct.nombre_trabajo,
                label: ct.nombre_trabajo,
              }))}
            placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar condición"}
            error={errors.condicionTrabajo}
            required
            disabled={loadingCatalogos}
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
            options={condicionesActividad
              .filter(ca => ca.id_actividad !== 0 && ca.habilitado !== false) // Excluir "buscando trabajo" y deshabilitados
              .map(ca => ({
                value: ca.nombre_actividad,
                label: ca.nombre_actividad,
              }))}
            placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar condición"}
            error={errors.condicionActividad}
            required
            disabled={loadingCatalogos}
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
        return renderStepUbicacion(); // Ubicación
      case 2:
        return renderStep4(); // Nivel Educativo del Solicitante
      case 3:
        return renderStep5(); // Trabajo
      case 4:
        return renderStep2(); // Vivienda
      case 5:
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
        className="rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] w-[95vw] sm:w-[90vw] lg:w-[85vw] max-w-[1200px] mx-auto"
        showCloseButton={false}
      >
        <div className="p-4 sm:p-6 md:p-8 lg:p-12 relative max-h-[90vh] overflow-y-auto">
          {/* Botón de cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Título */}
          <h2 className="text-2xl font-normal text-foreground mb-6">
            {initialData ? 'Editar Solicitante' : 'Registro de Solicitante'}
          </h2>

          {/* Stepper - Oculto en móviles porque no cabe el texto de los 6 pasos */}
          <div className="hidden md:block">
            <Stepper steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Indicador de paso simplificado para móviles */}
          <div className="md:hidden flex flex-col items-center mb-6">
            <span className="text-sm font-medium text-gray-500 mb-1">Paso {currentStep + 1} de {STEPS.length}</span>
            <h3 className="text-lg font-semibold text-secondary">{STEPS[currentStep]}</h3>
          </div>

          {/* Contenido del paso */}
          <div className="min-h-[300px] mb-4">{renderStepContent()}</div>

          {/* Footer con botones */}
          <div className="flex flex-col border-t border-gray-200">
            {/* Nota sobre campos obligatorios */}
            <div className="flex items-center gap-1 pt-2 pb-2">
              <span className="text-danger font-medium text-sm">*</span>
              <span className="text-sm text-gray-600">Campo obligatorio</span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-2">
              <button
                onClick={handleClearForm}
                className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer transition-colors w-full sm:w-auto text-center sm:text-left"
              >
                Limpiar Formulario
              </button>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBack}
                    className="flex-1 sm:flex-none"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Atrás
                  </Button>
                )}
                {currentStep < STEPS.length - 1 ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleNext}
                    className="flex-1 sm:flex-none"
                  >
                    Siguiente
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {initialData ? 'Actualizando...' : 'Registrando...'}
                      </>
                    ) : (
                      initialData ? 'Actualizar' : 'Registrar'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

