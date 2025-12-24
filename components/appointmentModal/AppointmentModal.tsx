'use client';

import DatePicker from "../forms/DatePicker";
import { useState, useEffect } from "react";
import Modal from "../ui/feedback/Modal";
import Select from "../forms/Select";
import { createCitaAction } from "@/app/actions/citas";
import { getCaseIdsAction } from "@/app/actions/casos";
import ModalFooter from "../ui/ModalFooter";
import TextArea from "../forms/TextArea";

export function AppointmentModal() {
  const [date, setDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCaseID, setSelectedCaseID] = useState<string>("");
  const [orientacion, setOrientacion] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(true);
  const [caseOptions, setCaseOptions] = useState<{ value: string; label: string }[]>([]);

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

  const handleClose = () => {
    setDate(null);
    setEndDate(null);
    setSelectedCaseID("");
    setOrientacion("");
    setError(null);
    setSuccess(false);
    setIsOpen(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const result = await createCitaAction({
      caseId: Number(selectedCaseID),
      date: date ? date.toISOString().slice(0, 10) : "",
      endDate: endDate ? endDate.toISOString().slice(0, 10) : undefined,
      orientacion,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      // Limpiar el formulario tras éxito
      setDate(null);
      setEndDate(null);
      setSelectedCaseID("");
      setOrientacion("");
    } else {
      setError(result.error?.message || "Error al crear la cita");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="custom"
      className="rounded-[50px] max-w-[700px] mx-auto"
      showCloseButton={false}
    >
      <div className="p-10 relative">
        {/* Botón de cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <span className="text-2xl">×</span>
        </button>

        {/* Título */}
        <h2 className="text-2xl font-normal text-foreground mb-6">Registrar nueva cita</h2>

        {/* Grid de formulario */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
          {/* Fila 1: Caso y Fecha de Encuentro */}
          <div className="col-span-1">
            <Select
              label="Caso *"
              options={caseOptions}
              value={selectedCaseID}
              onChange={(e) => setSelectedCaseID(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="col-span-1">
            <label className="text-base font-normal text-foreground mb-1 block">
              Fecha de Encuentro <span className="text-danger">*</span>
            </label>
            <DatePicker
              value={date ? date.toISOString().slice(0, 10) : ""}
              onChange={(value: string) => setDate(value ? new Date(value) : null)}
              required
            />
          </div>

          {/* Fila 2: Fecha de Próxima cita (opcional) */}
          <div className="col-span-2">
            <label className="text-base font-normal text-foreground mb-1 block">
              Fecha de Próxima cita
            </label>
            <DatePicker
              value={endDate ? endDate.toISOString().slice(0, 10) : ""}
              onChange={(value: string) => setEndDate(value ? new Date(value) : null)}
            />
          </div>

          {/* Fila 3: Orientación */}
          <div className="col-span-2">
            <label className="text-base font-normal text-foreground mb-1 block">
              Orientación <span className="text-danger">*</span>
            </label>
            <TextArea
              placeholder="Escribe aquí la Orientación..."
              minLength={10}
              maxLength={500}
              value={orientacion}
              onChange={(e) => setOrientacion(e.target.value)}
              required
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-right mt-1 select-none">
              {orientacion.length}/500
            </div>
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="col-span-2 text-danger mb-2">{error}</div>
          )}
          {success && (
            <div className="col-span-2 text-success mb-2">¡Cita creada exitosamente!</div>
          )}
        </form>

        {/* Footer con nota y botón */}
        <div className="flex flex-col border-t border-gray-200 pt-2">
          <div className="flex items-center gap-1 pb-4">
            <span className="text-danger font-medium text-sm">*</span>
            <span className="text-sm text-gray-600">Campo obligatorio</span>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white font-semibold rounded-full px-8 py-3 text-base shadow hover:bg-primary-dark transition-colors disabled:opacity-60"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}