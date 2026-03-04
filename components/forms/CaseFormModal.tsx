'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from '../ui/feedback/Modal';
import Input from './Input';
import Select from './Select';
import TextArea from './TextArea';
import DatePicker from './DatePicker';
import Button from '../ui/Button';
import CedulaInput from './CedulaInput';
import { X, Calendar, Upload, File, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import { TRAMITES, ESTATUS_CASO } from '@/lib/constants/status';

interface CaseData {
  id_caso: number;
  fecha_solicitud: string | Date;
  tramite: string;
  observaciones: string;
  id_nucleo: number;
  id_materia: number;
  num_categoria: number;
  num_subcategoria: number;
  num_ambito_legal: number;
  cedula: string;
  nombre_completo_solicitante?: string;
  nombres_solicitante?: string;
  apellidos_solicitante?: string;
}

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => void | Promise<void>;
  initialCedula?: string;
  initialCedulaTipo?: string;
  isEditing?: boolean;
  initialData?: CaseData | null;
}

interface FormData {
  fechaCaso: string;
  casoNumero: number | string; // Autogenerado, read-only (solo número)
  cedulaSolicitanteTipo: string;
  cedulaSolicitante: string;
  materia: string; // id_materia
  categoria: string; // num_categoria (solo para Civil)
  subcategoria: string; // num_subcategoria (solo para Civil)
  ambitoLegal: string; // num_ambito_legal
  tramite: string;
  nucleo: string;
  observaciones: string;
}

export default function CaseFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialCedula = '',
  initialCedulaTipo = 'V',
  isEditing = false,
  initialData = null,
}: CaseFormModalProps) {
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar con fecha vacía, se establecerá cuando se abra el modal
  const [formData, setFormData] = useState<FormData>({
    fechaCaso: '',
    casoNumero: '',
    cedulaSolicitanteTipo: 'V',
    cedulaSolicitante: '',
    materia: '',
    categoria: '',
    subcategoria: '',
    ambitoLegal: '',
    tramite: '',
    nucleo: '',
    observaciones: '',
  });

  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [nucleos, setNucleos] = useState<Array<{ id_nucleo: number; nombre_nucleo: string; habilitado?: boolean }>>([]);
  const [materias, setMaterias] = useState<Array<{ id_materia: number; nombre_materia: string; habilitado?: boolean }>>([]);
  const [categorias, setCategorias] = useState<Array<{ num_categoria: number; nombre_categoria: string; habilitado?: boolean }>>([]);
  const [subcategorias, setSubcategorias] = useState<Array<{ num_subcategoria: number; nombre_subcategoria: string; habilitado?: boolean }>>([]);
  const [ambitosLegales, setAmbitosLegales] = useState<Array<{
    num_ambito_legal: number;
    nombre_ambito_legal: string;
    habilitado?: boolean;
  }>>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [loadingCaseNumber, setLoadingCaseNumber] = useState(false);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [checkingSolicitante, setCheckingSolicitante] = useState(false);
  const cedulaCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadNextCaseNumber = async () => {
    try {
      setLoadingCaseNumber(true);
      const { getNextCaseNumberAction } = await import('@/app/actions/casos');
      const result = await getNextCaseNumberAction();

      if (result.success && result.data?.nextNumber) {
        setFormData((prev) => ({
          ...prev,
          casoNumero: result.data!.nextNumber,
        }));
      }
    } catch (error) {
      console.error("Error loading next case number", error);
    } finally {
      setLoadingCaseNumber(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      // setLoadingCatalogos(true); // Ya se maneja afuera
      const { getNucleosAction } = await import('@/app/actions/nucleos');
      const { getMateriasAction } = await import('@/app/actions/materias');
      const [nucleosResult, materiasResult] = await Promise.all([
        getNucleosAction(),
        getMateriasAction(),
      ]);

      if (nucleosResult.success && nucleosResult.data) {
        setNucleos(nucleosResult.data);
      }

      if (materiasResult.success && materiasResult.data) {
        setMaterias(materiasResult.data);
      }
    } catch (error) {
      console.error("Error loading catalogs", error);
    }
  };

  const loadCategorias = async (idMateria: number) => {
    if (idMateria !== 1) {
      setCategorias([]);
      setSubcategorias([]);
      setAmbitosLegales([]);
      return;
    }

    try {
      const { getCategoriasByMateriaAction } = await import('@/app/actions/categorias');
      const result = await getCategoriasByMateriaAction(idMateria);

      if (result.success && result.data) {
        setCategorias(result.data);
      }
    } catch (error) {
      console.error("Error loading categories", error);
    }
  };

  const loadSubcategorias = async (idMateria: number, numCategoria: number) => {
    if (idMateria !== 1) {
      setSubcategorias([]);
      setAmbitosLegales([]);
      return;
    }

    try {
      const { getSubcategoriasByMateriaCategoriaAction } = await import('@/app/actions/subcategorias');
      const result = await getSubcategoriasByMateriaCategoriaAction(idMateria, numCategoria);

      if (result.success && result.data) {
        setSubcategorias(result.data);
      }
    } catch (error) {
      console.error("Error loading subcategories", error);
    }
  };

  const loadAmbitosLegales = async (
    idMateria: number,
    numCategoria: number = 0,
    numSubcategoria: number = 0
  ) => {
    try {
      const { getAmbitosLegalesByMateriaCategoriaSubcategoriaAction } = await import('@/app/actions/ambitos-legales');
      const result = await getAmbitosLegalesByMateriaCategoriaSubcategoriaAction(
        idMateria,
        numCategoria,
        numSubcategoria
      );

      if (result.success && result.data) {
        setAmbitosLegales(result.data);
      } else {
        setAmbitosLegales([]);
      }
    } catch (error) {
      setAmbitosLegales([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setArchivos([]);
      setFileError(null);

      const initializeForm = async () => {
        setLoadingCatalogos(true);
        if (!isEditing) setLoadingCaseNumber(true);
        // 1. Cargar catálogos base (Nucleos y Materias)
        await loadCatalogos();

        if (isEditing && initialData) {
          // MODO EDICIÓN

          // Separar cédula
          // initialData.cedula viene como 'V-12345678'
          const cedulaParts = initialData.cedula.split('-');
          let tipo = 'V';
          let cel = initialData.cedula;
          if (cedulaParts.length > 1) {
            tipo = cedulaParts[0];
            cel = cedulaParts[1];
          }

          // Cargar catálogos dependientes
          if (initialData.id_materia === 1) { // Civil
            await loadCategorias(initialData.id_materia);
            if (initialData.num_categoria !== undefined) {
              await loadSubcategorias(initialData.id_materia, initialData.num_categoria);
              if (initialData.num_subcategoria !== undefined) {
                await loadAmbitosLegales(initialData.id_materia, initialData.num_categoria, initialData.num_subcategoria);
              }
            }
          } else if (initialData.id_materia) {
            await loadAmbitosLegales(initialData.id_materia, 0, 0);
          }

          const formatDate = (dateVal: string | Date | undefined | null): string => {
            if (!dateVal) return getCurrentDate();
            if (dateVal instanceof Date) {
              const year = dateVal.getUTCFullYear();
              const month = String(dateVal.getUTCMonth() + 1).padStart(2, '0');
              const day = String(dateVal.getUTCDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            }
            if (typeof dateVal === 'string') {
              return dateVal.split('T')[0];
            }
            return getCurrentDate();
          };

          const initialFormState: FormData = {
            fechaCaso: formatDate(initialData.fecha_solicitud),
            casoNumero: initialData.id_caso,
            cedulaSolicitanteTipo: tipo,
            cedulaSolicitante: cel,
            materia: initialData.id_materia.toString(),
            categoria: initialData.num_categoria?.toString() || '',
            subcategoria: initialData.num_subcategoria?.toString() || '',
            ambitoLegal: initialData.num_ambito_legal?.toString() || '',
            tramite: initialData.tramite,
            nucleo: initialData.id_nucleo.toString(),
            observaciones: initialData.observaciones || '',
          };

          setFormData(initialFormState);
          setOriginalFormData(initialFormState);

        } else {
          // MODO CREACIÓN
          setOriginalFormData(null);
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const currentDate = `${year}-${month}-${day}`;

          setFormData({
            fechaCaso: currentDate,
            casoNumero: '',
            cedulaSolicitanteTipo: initialCedulaTipo || 'V',
            cedulaSolicitante: initialCedula || '',
            materia: '',
            categoria: '',
            subcategoria: '',
            ambitoLegal: '',
            tramite: '',
            nucleo: '',
            observaciones: '',
          });
          setCategorias([]);
          setSubcategorias([]);
          setAmbitosLegales([]);

          loadNextCaseNumber();
        }
        setLoadingCatalogos(false);
      };

      initializeForm();
    }
  }, [isOpen]); // Reduced dependencies to avoid loops, explicit re-init when opened.

  // Efecto para verificar si el solicitante existe cuando cambia la cédula (con debounce de 500ms)
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (cedulaCheckTimeoutRef.current) {
      clearTimeout(cedulaCheckTimeoutRef.current);
    }

    // Verificar si hay cédula
    if (formData.cedulaSolicitante && formData.cedulaSolicitante.trim().length > 0) {
      cedulaCheckTimeoutRef.current = setTimeout(async () => {
        const cedulaCompleta = `${formData.cedulaSolicitanteTipo}-${formData.cedulaSolicitante}`;

        try {
          setCheckingSolicitante(true);
          const { getSolicitanteByIdAction } = await import('@/app/actions/solicitantes');
          const result = await getSolicitanteByIdAction(cedulaCompleta);

          if (!result.success || !result.data) {
            // Solicitante no encontrado
            setErrors(prev => ({
              ...prev,
              cedulaSolicitante: 'No existe un solicitante con esta cédula'
            }));
          } else {
            // Solicitante encontrado - limpiar error si existe
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.cedulaSolicitante;
              return newErrors;
            });
          }
        } catch (err) {
          console.error('Error verificando solicitante:', err);
        } finally {
          setCheckingSolicitante(false);
        }
      }, 500); // Debounce de 500ms
    } else {
      // Si la cédula está vacía, limpiar el error de solicitante no encontrado
      setErrors(prev => {
        if (prev.cedulaSolicitante === 'No existe un solicitante con esta cédula') {
          const newErrors = { ...prev };
          delete newErrors.cedulaSolicitante;
          return newErrors;
        }
        return prev;
      });
    }

    // Cleanup
    return () => {
      if (cedulaCheckTimeoutRef.current) {
        clearTimeout(cedulaCheckTimeoutRef.current);
      }
    };
  }, [formData.cedulaSolicitanteTipo, formData.cedulaSolicitante]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fechaCaso) {
      newErrors.fechaCaso = 'Este campo es requerido';
    } else {
      const inputDate = new Date(formData.fechaCaso + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inputDate > today) {
        newErrors.fechaCaso = 'La fecha del caso no puede ser futura';
      }
    }
    if (!formData.cedulaSolicitante.trim()) {
      newErrors.cedulaSolicitante = 'Este campo es requerido';
    }
    if (!formData.materia) {
      newErrors.materia = 'Este campo es requerido';
    }
    if (formData.materia === '1') {
      if (!formData.categoria) {
        newErrors.categoria = 'Este campo es requerido';
      }
      if (!formData.subcategoria) {
        newErrors.subcategoria = 'Este campo es requerido';
      }
    }
    if (!formData.ambitoLegal) {
      newErrors.ambitoLegal = 'Este campo es requerido';
    }
    if (!formData.tramite) {
      newErrors.tramite = 'Este campo es requerido';
    }
    if (!formData.nucleo) {
      newErrors.nucleo = 'Este campo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      // Verificar cambios en modo edición
      if (isEditing && originalFormData && archivos.length === 0) {
        const hasChanges =
          formData.fechaCaso !== originalFormData.fechaCaso ||
          formData.tramite !== originalFormData.tramite ||
          formData.nucleo !== originalFormData.nucleo ||
          formData.materia !== originalFormData.materia ||
          formData.categoria !== originalFormData.categoria ||
          formData.subcategoria !== originalFormData.subcategoria ||
          formData.ambitoLegal !== originalFormData.ambitoLegal ||
          formData.observaciones !== originalFormData.observaciones ||
          (formData.cedulaSolicitanteTipo + '-' + formData.cedulaSolicitante) !== (originalFormData.cedulaSolicitanteTipo + '-' + originalFormData.cedulaSolicitante);

        if (!hasChanges) {
          toast.info('No se han detectado cambios para guardar.', 'Sin cambios');
          return;
        }
      }

      const cedulaCompletaSolicitante = `${formData.cedulaSolicitanteTipo}-${formData.cedulaSolicitante}`;

      const numCategoria = formData.materia === '1' && formData.categoria
        ? (parseInt(formData.categoria) || 0)
        : 0;
      const numSubcategoria = formData.materia === '1' && formData.subcategoria
        ? (parseInt(formData.subcategoria) || 0)
        : 0;

      const apiData = {
        fecha_solicitud: formData.fechaCaso || getCurrentDate(),
        fecha_inicio_caso: formData.fechaCaso || getCurrentDate(),
        cedula: cedulaCompletaSolicitante,
        id_materia: parseInt(formData.materia),
        num_categoria: numCategoria,
        num_subcategoria: numSubcategoria,
        num_ambito_legal: parseInt(formData.ambitoLegal),
        tramite: formData.tramite,
        estatus: isEditing ? undefined : ESTATUS_CASO.ASESORIA,
        id_nucleo: parseInt(formData.nucleo),
        observaciones: formData.observaciones,
        archivos: archivos,
        id_caso: isEditing ? ((initialData?.id_caso) as number) : undefined,
      };

      try {
        setIsSubmitting(true);
        await onSubmit(apiData);
      } catch (error) {
        console.error('Error submitting case:', error);

        // Parsear el error para mostrar mensaje apropiado
        if (error instanceof Error) {
          const errorMsg = error.message;

          if (errorMsg.startsWith('SOLICITANTE_NOT_FOUND:')) {
            // Error de solicitante no encontrado - mostrar debajo del campo de cédula
            const message = errorMsg.replace('SOLICITANTE_NOT_FOUND:', '');
            setErrors(prev => ({
              ...prev,
              cedulaSolicitante: message || 'El solicitante no está registrado en el sistema'
            }));
          } else if (errorMsg.startsWith('VALIDATION_ERROR:')) {
            // Error de validación general
            const message = errorMsg.replace('VALIDATION_ERROR:', '');
            toast.error(message, 'Error de validación');
          } else {
            // Otros errores
            const parts = errorMsg.split(':');
            const message = parts.length > 1 ? parts.slice(1).join(':') : errorMsg;
            toast.error(message, 'Error');
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    // Reset form only on close if not persisting? Or rely on useEffect to init on open?
    // Doing standard reset here.
    setFormData({
      fechaCaso: getCurrentDate(),
      casoNumero: '',
      cedulaSolicitanteTipo: 'V',
      cedulaSolicitante: '',
      materia: '',
      categoria: '',
      subcategoria: '',
      ambitoLegal: '',
      tramite: '',
      nucleo: '',
      observaciones: '',
    });
    setErrors({});
    setArchivos([]);
    setCategorias([]);
    setSubcategorias([]);
    setAmbitosLegales([]);
    onClose();
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB en bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFileError(null);

      const invalidFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
      if (invalidFiles.length > 0) {
        const fileNames = invalidFiles.map(f => f.name).join(', ');
        setFileError(`Los siguientes archivos exceden el límite de 10MB: ${fileNames}`);
        const validFiles = newFiles.filter(file => file.size <= MAX_FILE_SIZE);
        setArchivos((prev) => [...prev, ...validFiles]);
        return;
      }

      setArchivos((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === 'materia') {
        newData.categoria = '';
        newData.subcategoria = '';
        newData.ambitoLegal = '';
        setCategorias([]);
        setSubcategorias([]);
        setAmbitosLegales([]);

        if (value === '1') {
          loadCategorias(parseInt(value));
        } else if (value) {
          loadAmbitosLegales(parseInt(value), 0, 0);
        }
      }

      if (field === 'categoria' && prev.materia === '1') {
        newData.subcategoria = '';
        newData.ambitoLegal = '';
        setSubcategorias([]);
        setAmbitosLegales([]);

        if (value) {
          loadSubcategorias(parseInt(prev.materia), parseInt(value));
        }
      }

      if (field === 'subcategoria' && prev.materia === '1') {
        newData.ambitoLegal = '';
        setAmbitosLegales([]);

        if (value && prev.categoria) {
          loadAmbitosLegales(parseInt(prev.materia), parseInt(prev.categoria), parseInt(value));
        }
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="custom"
      className="rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] w-[95vw] sm:w-[90vw] lg:w-[85vw] max-w-[1200px] mx-auto"
      showCloseButton={false}
    >
      <div className="p-4 sm:p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] rounded-md transition-colors z-10 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-normal text-[var(--foreground)] mb-3">{isEditing ? 'Editar Caso' : 'Registro de Caso'}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-2.5 mb-3">
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-[var(--foreground)] mb-1">Fecha del Caso <span className="text-danger">*</span></label>
              <div className="relative">
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
              value={isEditing ? (formData.casoNumero || '') : (loadingCaseNumber ? 'Cargando...' : (formData.casoNumero || ''))}
              readOnly
              disabled
              placeholder={loadingCaseNumber ? "Cargando..." : ""}
            />
          </div>
          <div className="col-span-1">
            <CedulaInput
              label="Cédula de Solicitante *"
              tipoValue={formData.cedulaSolicitanteTipo}
              onTipoChange={(value) => updateField('cedulaSolicitanteTipo', value)}
              value={formData.cedulaSolicitante}
              onChange={(e) => updateField('cedulaSolicitante', e.target.value)}
              placeholder="Ingrese cédula de solicitante"
              error={errors.cedulaSolicitante}
              required
            />
          </div>

          <div className="col-span-1">
            <Select
              label="Trámite *"
              value={formData.tramite}
              onChange={(e) => updateField('tramite', e.target.value)}
              options={[
                { value: TRAMITES.ASESORIA, label: TRAMITES.ASESORIA },
                { value: TRAMITES.CONCILIACION_MEDIACION, label: TRAMITES.CONCILIACION_MEDIACION },
                { value: TRAMITES.REDACCION_DOCUMENTOS, label: TRAMITES.REDACCION_DOCUMENTOS },
                { value: TRAMITES.ASISTENCIA_JUDICIAL, label: TRAMITES.ASISTENCIA_JUDICIAL },
              ]}
              placeholder="Seleccionar trámite"
              error={errors.tramite}
              required
            />
          </div>
          <div className="col-span-1">
            <Select
              label="Núcleo *"
              value={formData.nucleo}
              onChange={(e) => updateField('nucleo', e.target.value)}
              options={nucleos
                .filter((nucleo) => nucleo.habilitado !== false)
                .map((nucleo) => ({
                  value: nucleo.id_nucleo.toString(),
                  label: nucleo.nombre_nucleo,
                }))}
              placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar núcleo"}
              error={errors.nucleo}
              required
            />
          </div>
          <div className="col-span-1">
            <Select
              label="Materia *"
              value={formData.materia}
              onChange={(e) => updateField('materia', e.target.value)}
              options={materias.map((materia) => ({
                value: materia.id_materia.toString(),
                label: materia.nombre_materia,
              }))}
              placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar materia"}
              error={errors.materia}
              required
            />
          </div>

          {formData.materia === '1' && (
            <>
              <div className="col-span-1">
                <Select
                  label="Categoría *"
                  value={formData.categoria}
                  onChange={(e) => updateField('categoria', e.target.value)}
                  options={categorias
                    .filter((cat) => cat.habilitado !== false)
                    .map((cat) => ({
                      value: cat.num_categoria.toString(),
                      label: cat.nombre_categoria,
                    }))}
                  placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar categoría"}
                  error={errors.categoria}
                  required
                />
              </div>
              <div className="col-span-1">
                <Select
                  label="Subcategoría *"
                  value={formData.subcategoria}
                  onChange={(e) => updateField('subcategoria', e.target.value)}
                  options={subcategorias
                    .filter((sub) => sub.habilitado !== false)
                    .map((sub) => ({
                      value: sub.num_subcategoria.toString(),
                      label: sub.nombre_subcategoria,
                    }))}
                  placeholder={formData.categoria ? "Seleccionar subcategoría" : "Primero seleccione categoría"}
                  error={errors.subcategoria}
                  required
                  disabled={!formData.categoria}
                />
              </div>
              <div className="col-span-1">
                <Select
                  label="Ámbito Legal *"
                  value={formData.ambitoLegal}
                  onChange={(e) => updateField('ambitoLegal', e.target.value)}
                  options={ambitosLegales
                    .filter((ambito) => ambito.habilitado !== false)
                    .map((ambito) => ({
                      value: ambito.num_ambito_legal.toString(),
                      label: ambito.nombre_ambito_legal,
                    }))}
                  placeholder={formData.subcategoria ? "Seleccionar ámbito legal" : "Primero seleccione subcategoría"}
                  error={errors.ambitoLegal}
                  required
                  disabled={!formData.subcategoria}
                />
              </div>
            </>
          )}

          {formData.materia && formData.materia !== '1' && (
            <div className="col-span-1">
              <Select
                label="Ámbito Legal *"
                value={formData.ambitoLegal}
                onChange={(e) => updateField('ambitoLegal', e.target.value)}
                options={ambitosLegales
                  .filter((ambito) => ambito.habilitado !== false)
                  .map((ambito) => ({
                    value: ambito.num_ambito_legal.toString(),
                    label: ambito.nombre_ambito_legal,
                  }))}
                placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar ámbito legal"}
                error={errors.ambitoLegal}
                required
              />
            </div>
          )}

          <div className="col-span-full">
            <TextArea
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) => updateField('observaciones', e.target.value)}
              placeholder="Ingrese observaciones del caso"
              error={errors.observaciones}
            />
          </div>

          <div className="col-span-full">
            <div className="flex flex-col gap-0.5">
              <label className="text-base font-normal text-foreground mb-0.5">
                Soportes/Documentos
              </label>

              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.wav,.ogg,.mp4,.avi,.mov,.wmv,.flv,.webm,.m4a,.aac,.wma"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--ui-border)] bg-[var(--input-bg)] cursor-pointer hover:opacity-80 transition-all"
                >
                  <Upload className="w-5 h-5 text-[var(--card-text-muted)]" />
                  <span className="text-base text-[var(--card-text)]">Seleccionar archivos</span>
                </label>
              </div>

              {archivos.length > 0 && (
                <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                  {archivos.map((archivo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-2 rounded-lg bg-[var(--ui-bg-muted)] border border-[var(--card-border)]"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="w-4 h-4 text-[var(--card-text-muted)] shrink-0" />
                        <span className="text-sm text-[var(--card-text)] truncate" title={archivo.name}>
                          {archivo.name}
                        </span>
                        <span className={`text-xs shrink-0 ${archivo.size > MAX_FILE_SIZE ? 'text-red-500 font-medium' : 'text-[var(--card-text-muted)]'}`}>
                          ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-2 p-1 text-danger hover:bg-danger/10 rounded-full transition-colors"
                        aria-label="Eliminar archivo"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {fileError && (
                <p className="text-xs text-danger mt-0.5">{fileError}</p>
              )}
              <p className="text-xs text-[var(--card-text-muted)] mt-0.5">
                Tamaño máximo por archivo: 10MB
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col border-t border-[var(--card-border)] mt-3 pt-3">
          <div className="flex items-center gap-1 pb-1.5">
            <span className="text-danger font-medium text-sm">*</span>
            <span className="text-sm text-[var(--card-text-muted)]">Campo obligatorio</span>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="xl" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isEditing ? 'Guardando...' : 'Registrando...'}
                </>
              ) : (
                isEditing ? 'Guardar Cambios' : 'Registrar Caso'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
