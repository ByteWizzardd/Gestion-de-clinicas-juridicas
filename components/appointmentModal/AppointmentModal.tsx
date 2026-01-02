'use client';

import DatePicker from "../forms/DatePicker";
import { useState, useEffect } from "react";
import Modal from "../ui/feedback/Modal";
import Select from "../forms/Select";
import MultiSelect from "../forms/MultiSelect";
import { createCitaAction, updateCitaAction } from "@/app/actions/citas";
import { getCaseIdsAction } from "@/app/actions/casos";
import { getUsuariosAction } from "@/app/actions/usuarios";
import TextArea from "../forms/TextArea";
import Button from "../ui/Button";
import { X, Calendar } from "lucide-react";
import type { Appointment } from "@/types/appointment";
interface AppointmentModalProps {
  onClose: () => void;
  onSave: () => void;
  initialDate?: Date;
  appointment?: Appointment | null; // Cita a editar (opcional)
}

interface FormData {
  selectedCaseID: string;
  date: string;
  endDate?: string;
  orientacion: string;
  usuariosAtienden: string[];
}

export function AppointmentModal({ onClose, onSave, initialDate, appointment }: AppointmentModalProps) {
  const isEditing = !!appointment;
  
  // Extraer el ID del caso del caseDetail si estamos editando
  const extractCaseId = (caseDetail: string): string => {
    const match = caseDetail.match(/C-(\d+)/);
    return match ? match[1] : "";
  };

  const [date, setDate] = useState<Date | null>(
    appointment ? appointment.date : (initialDate || null)
  );
  const [endDate, setEndDate] = useState<Date | null>(
    appointment && appointment.nextAppointmentDate
      ? new Date(appointment.nextAppointmentDate.split('/').reverse().join('-'))
      : null
  );
  const [selectedCaseID, setSelectedCaseID] = useState<string>(
    appointment ? extractCaseId(appointment.caseDetail) : ""
  );
  const [orientacion, setOrientacion] = useState<string>(
    appointment ? appointment.orientation : ""
  );
  const [usuariosAtienden, setUsuariosAtienden] = useState<string[]>(
    appointment && appointment.attendingUsersList
      ? appointment.attendingUsersList.map(u => u.id_usuario)
      : []
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(true);
  const [caseOptions, setCaseOptions] = useState<{ value: string; label: string }[]>([]);
  const [usuarioOptions, setUsuarioOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function fetchCaseIds() {
      const result = await getCaseIdsAction();
      if (result.success && result.data) {
        setCaseOptions(
          result.data.map((id) => ({
            value: id.toString(),
            label: `Caso #${id}`,
          }))
        );
      } else {
        setCaseOptions([]);
      }
    }
    fetchCaseIds();
  }, []);

  useEffect(() => {
    async function fetchUsuarios() {
      const result = await getUsuariosAction();
      if (result.success && result.data) {
        setUsuarioOptions(
          result.data.map((usuario) => ({
            value: usuario.cedula,
            label: usuario.nombre_completo || `${usuario.nombres} ${usuario.apellidos}`,
          }))
        );
      } else {
        setUsuarioOptions([]);
      }
    }
    fetchUsuarios();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Validación de Caso (selectedCaseID) - Solo requerido al crear, no al editar
    if (!isEditing) {
      if (!selectedCaseID) {
        newErrors.selectedCaseID = 'Este campo es requerido';
      } else {
        const caseIdNumber = Number(selectedCaseID);
        if (isNaN(caseIdNumber) || caseIdNumber <= 0 || !Number.isInteger(caseIdNumber)) {
          newErrors.selectedCaseID = 'El ID del caso debe ser un número válido';
        } else {
          const caseExists = caseOptions.some(opt => opt.value === selectedCaseID);
          if (!caseExists) {
            newErrors.selectedCaseID = 'El caso seleccionado no es válido';
          }
        }
      }
    }

    // Validación de Fecha de Encuentro (date) - Solo requerida al crear
    if (!isEditing && !date) {
      newErrors.date = 'Este campo es requerido';
    } else if (date) {
      const dateString = date.toISOString().slice(0, 10);
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateString)) {
        newErrors.date = 'Formato de fecha inválido';
      } else {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) {
          newErrors.date = 'Fecha inválida';
        }
      }
    }

    // Validación de Fecha de Próxima Cita (endDate) - OPCIONAL
    if (endDate) {
      const endDateString = endDate.toISOString().slice(0, 10);
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(endDateString)) {
        newErrors.endDate = 'Formato de fecha inválido';
      } else {
        const endDateObj = new Date(endDateString);
        if (isNaN(endDateObj.getTime())) {
          newErrors.endDate = 'Fecha inválida';
        } else if (date) {
          const dateObj = new Date(date.toISOString().slice(0, 10));
          if (endDateObj <= dateObj) {
            newErrors.endDate = 'La fecha de la próxima cita debe ser posterior a la fecha de encuentro';
          }
        }
      }
    }

    // Validación de Usuarios que Atendieron (usuariosAtienden)
    // Al editar, si no se proporciona usuariosAtienden, no se valida (se mantienen los existentes)
    if (!isEditing && usuariosAtienden.length === 0) {
      newErrors.usuariosAtienden = 'Debe seleccionar al menos un usuario';
    } else if (usuariosAtienden.length > 0) {
      // Validar duplicados
      const uniqueCedulas = new Set(usuariosAtienden);
      if (uniqueCedulas.size !== usuariosAtienden.length) {
        newErrors.usuariosAtienden = 'No puede seleccionar usuarios duplicados';
      } else {
        // Validar que todos existan en las opciones
        const invalidCedulas = usuariosAtienden.filter(
          cedula => !usuarioOptions.some(opt => opt.value === cedula)
        );
        if (invalidCedulas.length > 0) {
          newErrors.usuariosAtienden = 'Algunos usuarios seleccionados no son válidos';
        } else if (usuariosAtienden.length > 10) {
          newErrors.usuariosAtienden = 'No puede seleccionar más de 10 usuarios';
        }
      }
    }

    // Validación de Orientación (orientacion) - Solo requerida al crear
    if (!isEditing) {
      const orientacionTrimmed = orientacion.trim();
      if (!orientacionTrimmed) {
        newErrors.orientacion = 'Este campo es requerido';
      } else if (orientacionTrimmed.length < 10) {
        newErrors.orientacion = 'La orientación debe tener al menos 10 caracteres';
      } else if (!/\w/.test(orientacionTrimmed)) {
        newErrors.orientacion = 'La orientación debe contener texto válido';
      }
    } else if (orientacion.trim().length > 0 && orientacion.trim().length < 10) {
      // Al editar, si se proporciona orientación, debe cumplir el mínimo
      newErrors.orientacion = 'La orientación debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: keyof FormData, value: string | string[]) => {
    if (field === 'selectedCaseID') {
      setSelectedCaseID(value as string);
    } else if (field === 'orientacion') {
      setOrientacion(value as string);
    } else if (field === 'usuariosAtienden') {
      setUsuariosAtienden(value as string[]);
    }
    
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleClose = () => {
    // Iniciar animación de salida
    setIsOpen(false);
    // Esperar a que la animación termine antes de llamar al callback del padre
    // La animación del Modal tiene una duración de 0.2 segundos
    setTimeout(() => {
      setDate(initialDate || null);
      setEndDate(null);
      setSelectedCaseID("");
      setOrientacion("");
      setUsuariosAtienden([]);
      setErrors({});
      setError(null);
      setSuccess(false);
      if (onClose) onClose();
    }, 200); // 200ms coincide con la duración de la animación del Modal
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);

    let result;
    
    if (isEditing && appointment) {
      // Modo edición
      // Construir objeto de actualización con los campos modificados
      const updateParams: {
        appointmentId: string;
        date?: string;
        endDate?: string | null;
        orientacion?: string;
        usuariosAtienden?: string[];
      } = {
        appointmentId: appointment.id,
      };

      // Incluir fecha si está presente (siempre se envía si hay fecha)
      if (date) {
        updateParams.date = date.toISOString().slice(0, 10);
      }

      // Manejar fecha de próxima cita
      // Si endDate es null, significa que el usuario quiere eliminar la fecha
      // Si endDate es undefined, no se envía (no se modifica)
      if (endDate !== undefined) {
        updateParams.endDate = endDate ? endDate.toISOString().slice(0, 10) : null;
      }

      // Incluir orientación si está presente y no está vacía
      if (orientacion && orientacion.trim()) {
        updateParams.orientacion = orientacion.trim();
      }

      // Incluir usuarios si hay seleccionados
      if (usuariosAtienden.length > 0) {
        updateParams.usuariosAtienden = usuariosAtienden;
      }

      result = await updateCitaAction(updateParams);
    } else {
      // Modo creación
      result = await createCitaAction({
        caseId: Number(selectedCaseID),
        date: date ? date.toISOString().slice(0, 10) : "",
        endDate: endDate ? endDate.toISOString().slice(0, 10) : undefined,
        orientacion,
        usuariosAtienden: usuariosAtienden,
      });
    }

    setLoading(false);
    if (result.success && result.data) {
      setSuccess(true);
      // Limpiar el formulario tras éxito
      setDate(initialDate || null);
      setEndDate(null);
      setSelectedCaseID("");
      setOrientacion("");
      setUsuariosAtienden([]);
      setErrors({});
      onSave();
      if (onClose) onClose();
    } else {
      setError(result.error?.message || (isEditing ? "Error al actualizar la cita" : "Error al crear la cita"));
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
        <h2 className="text-2xl font-normal text-foreground mb-6">
          {isEditing ? 'Modificar cita' : 'Registrar nueva cita'}
        </h2>

        {/* Grid de formulario */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-3 gap-x-6 gap-y-4 mb-6">
          {/* Fila 1: Caso, Fecha de Encuentro, Fecha de Próxima cita */}
          <div className="col-span-1">
            <Select
              label={isEditing ? "Caso" : "Caso *"}
              options={caseOptions}
              value={selectedCaseID}
              onChange={(e) => updateField('selectedCaseID', e.target.value)}
              error={errors.selectedCaseID}
              required={!isEditing}
              disabled={isEditing}
              className="w-full"
            />
          </div>
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">
                Fecha de Encuentro <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  value={date ? date.toISOString().slice(0, 10) : ""}
                  onChange={(value: string) => {
                    setDate(value ? new Date(value) : null);
                    // Limpiar error del campo cuando se modifica
                    if (errors.date) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.date;
                        return newErrors;
                      });
                    }
                  }}
                  error={errors.date}
                  required
                />
              </div>
              {errors.date && (
                <p className="text-xs text-danger mt-1">{errors.date}</p>
              )}
            </div>
          </div>
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">
                Fecha de Próxima cita
              </label>
              <div className="relative">
                <DatePicker
                  value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                  onChange={(value: string) => {
                    setEndDate(value ? new Date(value) : null);
                    // Limpiar error del campo cuando se modifica
                    if (errors.endDate) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.endDate;
                        return newErrors;
                      });
                    }
                  }}
                  error={errors.endDate}
                />
              </div>
              {errors.endDate && (
                <p className="text-xs text-danger mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Fila 2: Usuarios que atendieron */}
          <div className="col-span-3">
            <MultiSelect
              label="Usuarios que atendieron *"
              options={usuarioOptions}
              value={usuariosAtienden}
              onChange={(values) => updateField('usuariosAtienden', values)}
              placeholder="Seleccione los usuarios que atendieron la cita"
              error={errors.usuariosAtienden}
              required
            />
          </div>

          {/* Fila 3: Orientación */}
          <div className="col-span-3">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">
                Orientación <span className="text-danger">*</span>
              </label>
              <textarea
                className={`w-full px-4 py-3 rounded-lg border bg-[#E5E7EB] ${
                  errors.orientacion ? 'border-danger' : 'border-transparent'
                } focus:outline-none focus:ring-1 ${
                  errors.orientacion ? 'focus:ring-danger' : 'focus:ring-primary'
                } text-base placeholder:text-[#717171] resize-none`}
                placeholder="Escribe aquí la orientación..."
                maxLength={500}
                value={orientacion}
                onChange={(e) => updateField('orientacion', e.target.value)}
                rows={5}
              />
              {errors.orientacion && (
                <p className="text-xs text-danger mt-1">{errors.orientacion}</p>
              )}
              <div className="text-xs text-gray-500 text-right mt-1 select-none">
                {orientacion.length}/500
              </div>
            </div>
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="col-span-3 text-danger mb-2">{error}</div>
          )}
          {success && (
            <div className="col-span-3 text-success mb-2">
              {isEditing ? '¡Cita actualizada exitosamente!' : '¡Cita creada exitosamente!'}
            </div>
          )}
        </form>

        {/* Footer con botón */}
        <div className="flex flex-col border-t border-gray-200">
          {/* Nota sobre campos obligatorios */}
          <div className="flex items-center gap-1 pt-2 pb-2">
            <span className="text-danger font-medium text-sm">*</span>
            <span className="text-sm text-gray-600">Campo obligatorio</span>
          </div>
          
          <div className="flex justify-end">
            <Button variant="primary" size="xl" onClick={handleSubmit} disabled={loading}>
              {loading 
                ? (isEditing ? 'Actualizando...' : 'Registrando...') 
                : (isEditing ? 'Actualizar Cita' : 'Registrar Cita')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
