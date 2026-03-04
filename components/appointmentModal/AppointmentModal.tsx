'use client';

import DatePicker from "../forms/DatePicker";
import { useState, useEffect, useRef } from "react";
import Modal from "../ui/feedback/Modal";
import Select from "../forms/Select";
import MultiSelect from "../forms/MultiSelect";
import { createCitaAction, updateCitaAction } from "@/app/actions/citas";
import { getCaseIdsAction, getCasosByUsuarioAction, createAccionAction } from "@/app/actions/casos";
import { getUsuariosAction } from "@/app/actions/usuarios";
import TextArea from "../forms/TextArea";
import Button from "../ui/Button";
import ConfirmModal from "../ui/feedback/ConfirmModal";
import { X, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import { logger } from "@/lib/utils/logger";
import { formatDate } from "@/lib/utils/date-formatter";
import type { Appointment } from "@/types/appointment";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // Extraer el ID del caso del caseDetail si estamos editando
  const extractCaseId = (caseDetail?: string | null): string => {
    if (!caseDetail) return "";
    const match = caseDetail.match(/C-(\d+)/);
    return match ? match[1] : "";
  };

  const [date, setDate] = useState<Date | null>(
    appointment ? appointment.date : (initialDate || null)
  );
  const [endDate, setEndDate] = useState<Date | null>(
    appointment && appointment.nextAppointmentDate
      ? (() => {
        // nextAppointmentDate viene DD/MM/YYYY → parsear localmente para evitar desfase UTC
        const [dd, mm, yyyy] = appointment.nextAppointmentDate.split('/');
        return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
      })()
      : null
  );
  const [selectedCaseID, setSelectedCaseID] = useState<string>(
    appointment ? extractCaseId(appointment.caseDetail) : ""
  );
  const [orientacion, setOrientacion] = useState<string>(
    appointment?.orientation || ""
  );
  const [usuariosAtienden, setUsuariosAtienden] = useState<string[]>(
    appointment && appointment.attendingUsersList
      ? appointment.attendingUsersList.map(u => u.id_usuario)
      : []
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(true);
  const [caseOptions, setCaseOptions] = useState<{ value: string; label: string; isDisabled?: boolean }[]>([]);
  const [usuarioOptions, setUsuarioOptions] = useState<{ value: string; label: string }[]>([]);

  // Estados para el modal de confirmación de acción
  const [showActionConfirmModal, setShowActionConfirmModal] = useState(false);
  /* REMOVED: const [creatingAction, setCreatingAction] = useState(false); */
  const creatingActionRef = useRef(false); // Use ref for synchronous locking
  const [citaCreada, setCitaCreada] = useState<{
    id_caso: number;
    fecha: string;
    orientacion: string;
    usuariosAtienden: string[];
  } | null>(null);
  const [actionRegistered, setActionRegistered] = useState(false);
  const [areOptionsLoading, setAreOptionsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setAreOptionsLoading(true);
      try {
        const [userCasesResult, allCasesResult, usuariosResult] = await Promise.all([
          getCasosByUsuarioAction(),
          getCaseIdsAction(),
          getUsuariosAction(true)
        ]);

        // Procesar Casos
        const options: { value: string; label: string; isDisabled?: boolean }[] = [];
        if (userCasesResult.success && userCasesResult.data && userCasesResult.data.length > 0) {
          const userCaseIds = new Set(userCasesResult.data.map((c: { id_caso: number }) => c.id_caso));
          options.push({ value: '__header_mis_casos__', label: 'Mis casos', isDisabled: true });
          userCasesResult.data.forEach((caso: { id_caso: number }) => {
            options.push({ value: caso.id_caso.toString(), label: `Caso #${caso.id_caso}` });
          });

          if (allCasesResult.success && allCasesResult.data) {
            const otherCases = allCasesResult.data.filter((id: number) => !userCaseIds.has(id));
            if (otherCases.length > 0) {
              options.push({ value: '__header_otros_casos__', label: 'Otros casos', isDisabled: true });
              otherCases.forEach((id: number) => {
                options.push({ value: id.toString(), label: `Caso #${id}` });
              });
            }
          }
        } else if (allCasesResult.success && allCasesResult.data) {
          allCasesResult.data.forEach((id: number) => {
            options.push({ value: id.toString(), label: `Caso #${id}` });
          });
        }
        setCaseOptions(options);

        // Procesar Usuarios
        if (usuariosResult.success && usuariosResult.data) {
          setUsuarioOptions(usuariosResult.data.map((usuario) => ({
            value: usuario.cedula,
            label: usuario.nombre_completo || `${usuario.nombres} ${usuario.apellidos}`,
          })));
        } else {
          setUsuarioOptions([]);
        }
      } catch (error) {
        logger.error("Error loading options", error);
        toast.error("Error al cargar las opciones del formulario");
      } finally {
        setAreOptionsLoading(false);
      }
    }
    fetchData();
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
        } else if (!isEditing) {
          // Registrar Cita: la fecha debe ser hoy o en el pasado
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dateObj.setHours(0, 0, 0, 0);

          if (dateObj > today) {
            newErrors.date = 'La fecha del encuentro no puede ser posterior a hoy';
          }
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
      setErrors({});
      if (onClose) onClose();
    }, 200); // 200ms coincide con la duración de la animación del Modal
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (isEditing && appointment) {
      // Verificar si hay cambios reales
      const initialDateStr = appointment.date instanceof Date
        ? appointment.date.toISOString().slice(0, 10)
        : typeof appointment.date === 'string'
          ? (appointment.date as string).split('/').reverse().join('-') // Asumiendo DD/MM/YYYY si es string
          : ''; // Fallback

      // La fecha en el estado "date"
      const currentDateStr = date ? date.toISOString().slice(0, 10) : '';

      // Comparar Fecha Encuentro (ignorando hora si viene en Date)
      // Ajuste: si appointment.date viene como string DD/MM/YYYY, normalizar.
      // Si viene como Date, toISOString.
      let hasDateChange = false;
      if (appointment.date instanceof Date) {
        hasDateChange = appointment.date.toISOString().slice(0, 10) !== currentDateStr;
      } else if (typeof appointment.date === 'string') {
        // Asumimos formato ISO YYYY-MM-DD o DD/MM/YYYY? 
        // El componente DatePicker usa YYYY-MM-DD.
        // Verificando cómo viene el appointment... usualmente las fechas en JS/TS pueden ser tricky.
        // Mejor comparamos las fechas parseadas
        const d1 = new Date(appointment.date).setHours(0, 0, 0, 0);
        const d2 = date ? date.setHours(0, 0, 0, 0) : 0;
        hasDateChange = d1 !== d2;
      }

      // Comparar Fecha Próxima Cita
      let initialEndDateStr: string | null = null;
      if (appointment.nextAppointmentDate) {
        // nextAppointmentDate suele venir como string DD/MM/YYYY en la UI
        const parts = appointment.nextAppointmentDate.split('/');
        if (parts.length === 3) {
          initialEndDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else {
          initialEndDateStr = appointment.nextAppointmentDate;
        }
      }
      const currentEndDateStr = endDate ? endDate.toISOString().slice(0, 10) : null;
      const hasEndDateChange = initialEndDateStr !== currentEndDateStr;

      // Comparar Orientación
      const hasOrientacionChange = (appointment.orientation || '').trim() !== orientacion.trim();

      // Comparar Usuarios
      const initialUsers = (appointment.attendingUsersList || []).map(u => u.id_usuario).sort();
      const currentUsers = [...usuariosAtienden].sort();
      const hasUsersChange = JSON.stringify(initialUsers) !== JSON.stringify(currentUsers);

      if (!hasDateChange && !hasEndDateChange && !hasOrientacionChange && !hasUsersChange) {
        toast.info("No se han realizado cambios");
        onClose();
        return;
      }

      // Si hay cambios, continuamos con la lógica...
    }

    setLoading(true);

    try {
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
          // Usar fecha local (no toISOString que convierte a UTC y resta 1 día en zona -04:00)
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          updateParams.date = `${yyyy}-${mm}-${dd}`;
        }

        // Manejar fecha de próxima cita
        // Si endDate es null, significa que el usuario quiere eliminar la fecha
        // Si endDate es undefined, no se envía (no se modifica)
        if (endDate !== undefined) {
          if (endDate) {
            const yyyy = endDate.getFullYear();
            const mm = String(endDate.getMonth() + 1).padStart(2, '0');
            const dd = String(endDate.getDate()).padStart(2, '0');
            updateParams.endDate = `${yyyy}-${mm}-${dd}`;
          } else {
            updateParams.endDate = null;
          }
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
          date: date ? (() => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
          })() : "",
          endDate: endDate ? (() => {
            const yyyy = endDate.getFullYear();
            const mm = String(endDate.getMonth() + 1).padStart(2, '0');
            const dd = String(endDate.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
          })() : undefined,
          orientacion,
          usuariosAtienden: usuariosAtienden,
        });
      }

      setLoading(false);

      if (result.success && result.data) {
        toast.success(isEditing ? '¡Cita actualizada exitosamente!' : '¡Cita registrada exitosamente!');

        if (isEditing) {
          // Modo edición: verificar si era una cita programada que se completó

          // Modo edición: verificar si era una cita programada que se completó
          const wasScheduledAppointment = appointment?.orientation === 'Cita programada';

          if (wasScheduledAppointment && orientacion && orientacion.trim()) {
            // Era una cita programada y ahora se completó con orientación específica
            // Mostrar modal de confirmación para crear acción
            const citaData = {
              id_caso: Number(selectedCaseID),
              fecha: date ? (() => {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
              })() : "",
              orientacion: orientacion.trim(),
              usuariosAtienden: usuariosAtienden,
            };
            setCitaCreada(citaData);
            setShowActionConfirmModal(true);
            // NO cerrar el modal todavía, esperar respuesta del usuario
            return;
          }

          // Cerrar modal y recargar datos normalmente
          setDate(initialDate || null);
          setEndDate(null);
          setSelectedCaseID("");
          setOrientacion("");
          setUsuariosAtienden([]);
          setErrors({});
          onSave();
          if (onClose) onClose();
        } else {
          // Modo creación: guardar datos de la cita y mostrar modal de confirmación
          const citaData = {
            id_caso: Number(selectedCaseID),
            fecha: date ? date.toISOString().slice(0, 10) : "",
            orientacion: orientacion.trim(),
            usuariosAtienden: usuariosAtienden,
          };
          setCitaCreada(citaData);
          setShowActionConfirmModal(true);
          // NO cerrar el modal todavía, esperar respuesta del usuario
        }
      } else {
        toast.error(result.error?.message || (isEditing ? "Error al actualizar la cita" : "Error al crear la cita"));
      }
    } catch (error) {
      logger.error('Error al guardar cita:', error);
      setLoading(false);
      toast.error('Error al guardar la cita. Por favor, inténtelo de nuevo.');
    }
  };

  const handleCreateAction = async () => {
    if (!citaCreada || creatingActionRef.current) return;

    creatingActionRef.current = true;

    try {
      // Construir detalle de la acción
      const detalleAccion = `Cita realizada el ${formatDate(citaCreada.fecha)}`;

      // Construir ejecutores
      const ejecutores = citaCreada.usuariosAtienden.length > 0
        ? citaCreada.usuariosAtienden.map(cedula => ({
          idUsuario: cedula,
          fechaEjecucion: citaCreada.fecha, // YYYY-MM-DD
        }))
        : undefined;

      // Comentario: usar orientación si no está vacía
      const comentario = citaCreada.orientacion.trim() || undefined;

      // Crear la acción
      const result = await createAccionAction(
        citaCreada.id_caso,
        detalleAccion,
        comentario,
        ejecutores,
        undefined // fechaRegistro: usa fecha actual automáticamente
      );

      creatingActionRef.current = false;

      if (result.success) {
        // Guardar el id_caso antes de limpiar el estado
        const idCasoParaRedireccion = citaCreada.id_caso;

        // Cerrar modal de confirmación
        setShowActionConfirmModal(false);
        // Marcar acción como registrada
        setActionRegistered(true);
        setActionRegistered(true);
        // Limpiar formulario y cerrar modal inmediatamente
        setDate(initialDate || null);
        setEndDate(null);
        setSelectedCaseID("");
        setOrientacion("");
        setUsuariosAtienden([]);
        setErrors({});
        setIsOpen(false);
        setCitaCreada(null);
        if (onClose) onClose();

        // Después de crear la acción exitosamente, redirigir al detalle del caso
        setTimeout(() => {
          router.push(`/dashboard/cases/${idCasoParaRedireccion}?tab=acciones`);
        }, 500);
      } else {
        // Error al crear la acción (pero la cita ya está guardada)
        // Error al crear la acción (pero la cita ya está guardada)
        toast.error(result.error?.message || "Error al crear la acción. La cita fue guardada correctamente.");
        // Permitir cerrar el modal de confirmación para continuar
        setShowActionConfirmModal(false);
      }
    } catch (error) {
      creatingActionRef.current = false;
      toast.error(error instanceof Error ? error.message : "Error al crear la acción. La cita fue guardada correctamente.");
      setShowActionConfirmModal(false);
    }
  };

  const handleCancelAction = () => {
    // Cerrar modal de confirmación
    setShowActionConfirmModal(false);
    // Limpiar formulario
    setDate(initialDate || null);
    setEndDate(null);
    setSelectedCaseID("");
    setOrientacion("");
    setUsuariosAtienden([]);
    setErrors({});
    setCitaCreada(null);
    // Cerrar modal de cita
    setIsOpen(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 200);
    // Recargar datos
    onSave();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="custom"
      className="rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] w-[95vw] sm:w-[90vw] lg:w-[85vw] max-w-[1200px] mx-auto"
      showCloseButton={false}
    >
      <div className="p-6 sm:p-10 lg:p-12 relative">
        {/* Botón de cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] rounded-md transition-colors z-10 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Título */}
        <h2 className="text-2xl font-normal text-foreground mb-6">
          {isEditing ? 'Modificar cita' : 'Registrar nueva cita'}
        </h2>

        {/* Grid de formulario */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-6">
          {/* Fila 1: Caso, Fecha de Encuentro, Fecha de Próxima cita */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Select
              label={isEditing ? "Caso" : "Caso *"}
              options={caseOptions}
              value={selectedCaseID}
              onChange={(e) => updateField('selectedCaseID', e.target.value)}
              error={errors.selectedCaseID}
              required={!isEditing}
              disabled={isEditing || areOptionsLoading}
              className="w-full"
              placeholder={areOptionsLoading ? "Cargando casos..." : "Seleccione el caso relacionado"}
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
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <MultiSelect
              label="Personas que atendieron *"
              options={usuarioOptions}
              value={usuariosAtienden}
              onChange={(values) => updateField('usuariosAtienden', values)}
              placeholder={areOptionsLoading ? "Cargando usuarios..." : "Seleccione los usuarios que atendieron la cita"}
              error={errors.usuariosAtienden}
              required
              disabled={areOptionsLoading}
            />
          </div>

          {/* Fila 3: Orientación */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">
                Orientación <span className="text-danger">*</span>
              </label>
              <textarea
                className={`w-full px-4 py-3 rounded-lg border bg-[var(--input-bg)] ${errors.orientacion ? 'border-danger' : 'border-transparent'
                  } focus:outline-none focus:ring-1 ${errors.orientacion ? 'focus:ring-danger' : 'focus:ring-primary'
                  } text-base text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] resize-none transition-colors`}
                placeholder="Escribe aquí la orientación..."
                maxLength={500}
                value={orientacion}
                onChange={(e) => updateField('orientacion', e.target.value)}
                rows={5}
              />
              {errors.orientacion && (
                <p className="text-xs text-danger mt-1">{errors.orientacion}</p>
              )}
              <div className="text-xs text-[var(--card-text-muted)] text-right mt-1 select-none transition-colors">
                {(orientacion || "").length}/500
              </div>
            </div>
          </div>

          {/* Mensajes de error y éxito */}
          {/* No mostramos mensajes de error/éxito inline ya que usamos Toast */}
        </form>

        {/* Footer con botón */}
        <div className="flex flex-col border-t border-[var(--dropdown-border)] transition-colors">
          {/* Nota sobre campos obligatorios */}
          <div className="flex items-center gap-1 pt-2 pb-2">
            <span className="text-danger font-medium text-sm">*</span>
            <span className="text-sm text-[var(--card-text-muted)] transition-colors">Campo obligatorio</span>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Registrando...'}
                </>
              ) : (
                isEditing ? 'Actualizar Cita' : 'Registrar Cita'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para registrar como acción */}
      <ConfirmModal
        isOpen={showActionConfirmModal}
        onClose={handleCancelAction}
        onConfirm={handleCreateAction}
        title="Confirmación"
        message="Se ha registrado la cita. ¿Desea agregarla también al historial de acciones del caso?"
        confirmLabel="Sí, agregar"
        cancelLabel="No, solo cita"
        disabled={creatingActionRef.current}
      />
    </Modal>
  );
}
