'use client';

import DatePicker from "../forms/DatePicker";
import { useState, useEffect } from "react";
import Modal from "../ui/feedback/Modal";
import Select from "../forms/Select";
import MultiSelect from "../forms/MultiSelect";
import { getCaseIdsAction } from "@/app/actions/casos";
import { getUsuariosAction } from "@/app/actions/usuarios";
import Button from "../ui/Button";
import { X } from "lucide-react";

interface AppointmentScheduleModalProps {
  onClose: () => void;
  onSave: () => void;
  initialDate?: Date;
}

interface FormData {
  selectedCaseID: string;
  date: string;
  usuariosInvitados: string[];
}

export function AppointmentScheduleModal({ onClose, onSave, initialDate }: AppointmentScheduleModalProps) {
  const [date, setDate] = useState<Date | null>(initialDate || null);
  const [selectedCaseID, setSelectedCaseID] = useState<string>("");
  const [usuariosInvitados, setUsuariosInvitados] = useState<string[]>([]);
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

    if (!selectedCaseID) {
      newErrors.selectedCaseID = 'Este campo es requerido';
    }
    if (!selectedCaseID) {
      newErrors.selectedCaseID = 'Este campo es requerido';
    }
    if (!date) {
      newErrors.date = 'Este campo es requerido';
    }
    if (usuariosInvitados.length === 0) {
      newErrors.usuariosInvitados = 'Este campo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: keyof FormData, value: string | string[]) => {
    if (field === 'selectedCaseID') {
      setSelectedCaseID(value as string);
    } else if (field === 'usuariosInvitados') {
      setUsuariosInvitados(value as string[]);
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
    setTimeout(() => {
      setDate(initialDate || null);
      setSelectedCaseID("");
      setUsuariosInvitados([]);
      setErrors({});
      setError(null);
      setSuccess(false);
      if (onClose) onClose();
    }, 200);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);

    // Simular creación de cita programada
    // Aquí iría la lógica real para crear la cita programada
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setDate(initialDate || null);
      setSelectedCaseID("");
      setUsuariosInvitados([]);
      setErrors({});
      onSave();
      if (onClose) onClose();
    }, 1000);
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="custom"
      className="rounded-[50px] max-w-[900px] mx-auto"
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
        <h2 className="text-2xl font-normal text-foreground mb-6">Programar nueva cita</h2>

        {/* Grid de formulario */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
          {/* Fila 1: Caso, Fecha de Encuentro, Hora */}
          <div className="col-span-1">
            <Select
              label="Caso *"
              options={caseOptions}
              value={selectedCaseID}
              onChange={(e) => updateField('selectedCaseID', e.target.value)}
              error={errors.selectedCaseID}
              required
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
            </div>
          </div>


          {/* Fila 3: Usuarios invitados */}
          <div className="col-span-3">
            <MultiSelect
              label="Usuarios invitados *"
              options={usuarioOptions}
              value={usuariosInvitados}
              onChange={(values) => updateField('usuariosInvitados', values)}
              placeholder="Seleccione los usuarios que serán invitados a la cita"
              error={errors.usuariosInvitados}
              required
            />
          </div>


          {/* Mensajes de error y éxito */}
          {error && (
            <div className="col-span-3 text-danger mb-2">{error}</div>
          )}
          {success && (
            <div className="col-span-3 text-success mb-2">¡Cita programada exitosamente!</div>
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
              {loading ? 'Programando...' : 'Programar Cita'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
