'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/feedback/Modal';
import Input from './Input';
import Select from './Select';
import TextArea from './TextArea';
import DatePicker from './DatePicker';
import Button from '../ui/Button';
import CedulaInput from './CedulaInput';
import { X, Calendar, Upload, File, XCircle } from 'lucide-react';
import { TRAMITES, ESTATUS_CASO } from '@/lib/constants/status';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => void;
  initialCedula?: string;
  initialCedulaTipo?: string;
}

interface FormData {
  fechaCaso: string;
  casoNumero: number | string; // Autogenerado, read-only (solo número)
  cedulaSolicitanteTipo: string;
  cedulaSolicitante: string;
  tipoCaso: string;
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
}: CaseFormModalProps) {
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  // Usa la misma lógica que el componente DateTime
  const getCurrentDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Inicializar con fecha vacía, se establecerá cuando se abra el modal
  const [formData, setFormData] = useState<FormData>({
    fechaCaso: '', // Se establecerá cuando se abra el modal para evitar problemas de zona horaria
    casoNumero: '', // Se cargará automáticamente al abrir el modal
    cedulaSolicitanteTipo: 'V',
    cedulaSolicitante: '',
    tipoCaso: '',
    tramite: '',
    nucleo: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [nucleos, setNucleos] = useState<Array<{ id_nucleo: number; nombre_nucleo: string }>>([]);
  const [ambitosLegales, setAmbitosLegales] = useState<Array<{ id_ambito_legal: number; materia: string; tipo: string }>>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [loadingCaseNumber, setLoadingCaseNumber] = useState(false);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Cargar catálogos y siguiente número de caso al abrir el modal
  // También actualizar la fecha actual (misma lógica que DateTime)
  useEffect(() => {
    if (isOpen) {
      // Limpiar el formulario cuando se abre el modal
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
        tipoCaso: '',
        tramite: '',
        nucleo: '',
        observaciones: '',
      });
      setErrors({});
      setArchivos([]);
      
      loadCatalogos();
      loadNextCaseNumber();
    }
  }, [isOpen, initialCedula, initialCedulaTipo]);

  const loadNextCaseNumber = async () => {
    try {
      setLoadingCaseNumber(true);
      const response = await fetch('/api/casos?action=next-number');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.nextNumber) {
          setFormData((prev) => ({
            ...prev,
            casoNumero: result.data.nextNumber, // Solo el número
          }));
        }
      }
    } catch (error) {
      // Error al cargar siguiente número de caso
    } finally {
      setLoadingCaseNumber(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      const [nucleosRes, ambitosRes] = await Promise.all([
        fetch('/api/nucleos'),
        fetch('/api/ambitos-legales'),
      ]);

      if (nucleosRes.ok) {
        const nucleosData = await nucleosRes.json();
        setNucleos(nucleosData.data || []);
      }

      if (ambitosRes.ok) {
        const ambitosData = await ambitosRes.json();
        setAmbitosLegales(ambitosData.data || []);
      }
    } catch (error) {
      // Error al cargar catálogos
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fechaCaso) {
      newErrors.fechaCaso = 'Este campo es requerido';
    }
    if (!formData.cedulaSolicitante.trim()) {
      newErrors.cedulaSolicitante = 'Este campo es requerido';
    }
    // Nota: cedulaSolicitanteTipo siempre tiene un valor por defecto 'V'
    if (!formData.tipoCaso) {
      newErrors.tipoCaso = 'Este campo es requerido';
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
      // Mapear los datos del formulario a la estructura de la BD
      // Combinar tipo y número de cédula del solicitante
      const cedulaCompletaSolicitante = `${formData.cedulaSolicitanteTipo}${formData.cedulaSolicitante}`;
      
      const apiData = {
        fecha_solicitud: formData.fechaCaso || getCurrentDate(), // Requerido, usa la fecha del formulario o la actual por defecto
        cedula_cliente: cedulaCompletaSolicitante,
        id_ambito_legal: parseInt(formData.tipoCaso),
        tramite: formData.tramite,
        estatus: ESTATUS_CASO.ASESORIA, // Siempre 'Asesoría' para casos nuevos
        id_nucleo: parseInt(formData.nucleo),
        observaciones: formData.observaciones,
        archivos: archivos, // Incluir archivos en los datos
      };

      onSubmit(apiData);
    }
  };

  const handleClose = () => {
    setFormData({
      fechaCaso: getCurrentDate(), // Resetear a fecha actual
      casoNumero: '', // Se recargará al abrir el modal nuevamente
      cedulaSolicitanteTipo: 'V',
      cedulaSolicitante: '',
      tipoCaso: '',
      tramite: '',
      nucleo: '',
      observaciones: '',
    });
    setErrors({});
    setArchivos([]);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setArchivos((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
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
          <X className="w-6 h-6" />
        </button>
        
        {/* Título */}
        <h2 className="text-2xl font-normal text-foreground mb-6">Registro de Caso</h2>

        {/* Grid de formulario */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-6">
          {/* Fila 1: Fecha del Caso, Caso N°, Cédula de Solicitante */}
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">Fecha del Caso <span className="text-danger">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
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
              value={loadingCaseNumber ? '' : (formData.casoNumero || '')}
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

          {/* Fila 2: Tipo de Caso, Trámite */}
          <div className="col-span-1">
            <Select
              label="Tipo de Caso *"
              value={formData.tipoCaso}
              onChange={(e) => updateField('tipoCaso', e.target.value)}
              options={ambitosLegales.map((ambito) => ({
                value: ambito.id_ambito_legal.toString(),
                label: `${ambito.materia} (${ambito.tipo})`,
              }))}
              placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar tipo de caso"}
              error={errors.tipoCaso}
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

          {/* Fila 3: Núcleo */}
          <div className="col-span-1">
            <Select
              label="Núcleo *"
              value={formData.nucleo}
              onChange={(e) => updateField('nucleo', e.target.value)}
              options={nucleos.map((nucleo) => ({
                value: nucleo.id_nucleo.toString(),
                label: nucleo.nombre_nucleo,
              }))}
              placeholder={loadingCatalogos ? "Cargando..." : "Seleccionar núcleo"}
              error={errors.nucleo}
              required
            />
          </div>

          {/* Fila 4: Observaciones (ocupa todo el ancho) */}
          <div className="col-span-3">
            <TextArea
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) => updateField('observaciones', e.target.value)}
              placeholder="Ingrese observaciones del caso"
              error={errors.observaciones}
            />
          </div>

          {/* Fila 5: Soportes/Documentos (ocupa todo el ancho) */}
          <div className="col-span-3">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">
                Soportes/Documentos
              </label>
              
              {/* Input de carga de archivos */}
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-[#E5E7EB] cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-base text-foreground">Seleccionar archivos</span>
                </label>
              </div>

              {/* Lista de archivos seleccionados */}
              {archivos.length > 0 && (
                <div className="mt-2 space-y-2">
                  {archivos.map((archivo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 border border-gray-200"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-sm text-foreground truncate" title={archivo.name}>
                          {archivo.name}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          ({(archivo.size / 1024).toFixed(1)} KB)
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
            </div>
          </div>
        </div>

        {/* Footer con botón */}
        <div className="flex flex-col border-t border-gray-200">
          {/* Nota sobre campos obligatorios */}
          <div className="flex items-center gap-1 pt-2 pb-4">
            <span className="text-danger font-medium text-sm">*</span>
            <span className="text-sm text-gray-600">Campo obligatorio</span>
          </div>
          
          <div className="flex justify-end">
            <Button variant="primary" size="xl" onClick={handleSubmit}>
              Registrar Caso
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

