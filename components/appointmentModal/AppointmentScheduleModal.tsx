'use client';

import { useState, useEffect } from "react";
import Modal from "../ui/feedback/Modal";
import Select from "../forms/Select";
import MultiSelect from "../forms/MultiSelect";
import DatePicker from "../forms/DatePicker";
import { getCaseIdsAction, getCasosByUsuarioAction } from "@/app/actions/casos";
import { getUsuariosAction } from "@/app/actions/usuarios";
import { createCitaAction } from "@/app/actions/citas";
import Button from "../ui/Button";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/feedback/ToastProvider";

interface AppointmentScheduleModalProps {
  onClose: () => void;
  onSave: () => void;
  initialDate?: Date;
}

export function AppointmentScheduleModal({
  onClose,
  onSave,
  initialDate
}: AppointmentScheduleModalProps) {
  const [date, setDate] = useState<Date | null>(initialDate || null);
  const [selectedCaseID, setSelectedCaseID] = useState<string>("");
  const [usuariosInvitados, setUsuariosInvitados] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(true);
  const [caseOptions, setCaseOptions] = useState<{ value: string; label: string; isDisabled?: boolean }[]>([]);
  const [usuarioOptions, setUsuarioOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function fetchCaseIds() {
      // Obtener casos del usuario y todos los casos
      const [userCasesResult, allCasesResult] = await Promise.all([
        getCasosByUsuarioAction(),
        getCaseIdsAction()
      ]);

      const options: { value: string; label: string; isDisabled?: boolean }[] = [];

      // Primero agregar los casos del usuario con encabezado
      if (userCasesResult.success && userCasesResult.data && userCasesResult.data.length > 0) {
        const userCaseIds = new Set(userCasesResult.data.map((c: { id_caso: number }) => c.id_caso));

        // Encabezado "Mis casos"
        options.push({
          value: '__header_mis_casos__',
          label: 'Mis casos',
          isDisabled: true
        });

        // Agregar casos del usuario
        userCasesResult.data.forEach((caso: { id_caso: number }) => {
          options.push({
            value: caso.id_caso.toString(),
            label: `Caso #${caso.id_caso}`,
          });
        });

        // Agregar encabezado "Otros casos" si hay más casos
        if (allCasesResult.success && allCasesResult.data) {
          const otherCases = allCasesResult.data.filter((id: number) => !userCaseIds.has(id));

          if (otherCases.length > 0) {
            options.push({
              value: '__header_otros_casos__',
              label: 'Otros casos',
              isDisabled: true
            });

            otherCases.forEach((id: number) => {
              options.push({
                value: id.toString(),
                label: `Caso #${id}`,
              });
            });
          }
        }
      } else if (allCasesResult.success && allCasesResult.data) {
        // Si no hay casos del usuario, mostrar todos los casos sin encabezados
        allCasesResult.data.forEach((id: number) => {
          options.push({
            value: id.toString(),
            label: `Caso #${id}`,
          });
        });
      }

      setCaseOptions(options);
    }
    fetchCaseIds();
  }, []);

  useEffect(() => {
    async function fetchUsuarios() {
      const result = await getUsuariosAction(true);
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
    const newErrors: Record<string, string> = {};

    if (!selectedCaseID) {
      newErrors.selectedCaseID = 'Este campo es requerido';
    }

    if (!date) {
      newErrors.date = 'Este campo es requerido';
    } else {
      // Parse the date from state (which is already a Date object from DatePicker)
      // Get local date components to avoid UTC timezone issues
      const selectedYear = date.getFullYear();
      const selectedMonth = date.getMonth();
      const selectedDay = date.getDate();
      const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
      selectedDate.setHours(0, 0, 0, 0);

      if (isNaN(selectedDate.getTime())) {
        newErrors.date = 'Fecha inválida';
      } else {
        // Programar Cita: la fecha debe ser hoy o en el futuro
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          newErrors.date = 'La fecha de la cita programada no puede ser anterior a hoy';
        }
      }
    }

    if (usuariosInvitados.length === 0) {
      newErrors.usuariosInvitados = 'Debe seleccionar al menos un usuario';
    } else {
      const uniqueCedulas = new Set(usuariosInvitados);
      if (uniqueCedulas.size !== usuariosInvitados.length) {
        newErrors.usuariosInvitados = 'No puede seleccionar usuarios duplicados';
      } else {
        const invalidCedulas = usuariosInvitados.filter(
          cedula => !usuarioOptions.some(opt => opt.value === cedula)
        );
        if (invalidCedulas.length > 0) {
          newErrors.usuariosInvitados = 'Algunos usuarios seleccionados no son válidos';
        } else if (usuariosInvitados.length > 10) {
          newErrors.usuariosInvitados = 'No puede seleccionar más de 10 usuarios';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: string, value: string | string[]) => {
    if (field === 'selectedCaseID') {
      setSelectedCaseID(value as string);
    } else if (field === 'usuariosInvitados') {
      setUsuariosInvitados(value as string[]);
    }

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setDate(initialDate || null);
      setSelectedCaseID("");
      setUsuariosInvitados([]);
      setUsuariosInvitados([]);
      setErrors({});
      if (onClose) onClose();
    }, 200);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Crear cita programada con orientación por defecto
      const result = await createCitaAction({
        caseId: parseInt(selectedCaseID),
        date: date!.toISOString().split('T')[0], // Formato YYYY-MM-DD
        orientacion: "Cita programada", // Orientación por defecto para citas agendadas
        usuariosAtienden: usuariosInvitados
      });

      if (result.success) {
        toast.success("¡Cita programada exitosamente!");
        setDate(initialDate || null);
        setSelectedCaseID("");
        setUsuariosInvitados([]);
        setErrors({});
        onSave();
        if (onClose) onClose();
      } else {
        toast.error(result.error?.message || "Error al programar la cita");
      }
    } catch (error) {
      console.error("Error creating scheduled appointment:", error);
      toast.error("Error inesperado al programar la cita");
    } finally {
      setLoading(false);
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
      <div className="p-6 sm:p-10 lg:p-12 relative">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] rounded-md transition-colors z-10 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-normal text-foreground mb-6">
          Programar nueva cita
        </h2>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-6">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Select
              label="Caso *"
              options={caseOptions}
              value={selectedCaseID}
              onChange={(e) => updateField('selectedCaseID', e.target.value)}
              error={errors.selectedCaseID}
              required
              className="w-full"
              placeholder="Seleccione el caso relacionado"
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

          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <MultiSelect
              label="Personas que atenderán la cita *"
              options={usuarioOptions}
              value={usuariosInvitados}
              onChange={(values) => updateField('usuariosInvitados', values)}
              error={errors.usuariosInvitados}
              placeholder="Seleccione las personas que atenderán la cita"
              required
              className="w-full"
            />
          </div>


        </form>

        <div className="flex flex-col border-t border-[var(--dropdown-border)] transition-colors">
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
                  Programando...
                </>
              ) : (
                'Programar Cita'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
