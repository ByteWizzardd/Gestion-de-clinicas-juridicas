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
      console.log("Resultado de getCaseIdsAction:", result);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Opcional: limpiar el formulario o cerrar el modal
    } else {
      setError(result.error?.message || "Error al crear la cita");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      size="xl"
      className="overflow-y-auto"
      showCloseButton={false}
    >
      <div className="relative w-full max-w-175 mx-auto p-4 sm:p-8 md:p-10 min-h-auto">
        {/* Botón de cerrar */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 p-2 text-foreground hover:text-on-primary hover:bg-primary rounded-md transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <span className="text-2xl">X</span>
        </button>

        {/* Título */}
        <h2 className="font-primary text-xl sm:text-2xl font-semibold text-foreground mb-6 sm:mb-8">
          Registrar nueva cita
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="font-primary grid grid-cols-1 gap-y-4 sm:gap-y-6 mb-6">
          <div>
            <Select
              label="Caso *"
              options={caseOptions}
              value={selectedCaseID}
              onChange={(e) => setSelectedCaseID(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <label className="text-base font-primary font-normal text-foreground mb-1 block">
            Fecha de Encuentro <span className="text-danger">*</span>
          </label>
          <DatePicker
            value={date ? date.toISOString().slice(0, 10) : ""}
            onChange={(value: string) => setDate(value ? new Date(value) : null)}
            required
          />

          <label className="text-base font-primary font-normal text-foreground mb-1 block">
            Fecha de Próxima cita
          </label>
          <DatePicker
            value={endDate ? endDate.toISOString().slice(0, 10) : ""}
            onChange={(value: string) => setEndDate(value ? new Date(value) : null)}
          />

          <label className="text-base font-primary font-normal text-foreground mb-1 block">
            Descripción de la cita <span className="text-danger">*</span>
          </label>
          <TextArea
            placeholder="Escribe aquí los detalles de la cita..."
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
          {error && <div className="text-danger mb-2">{error}</div>}
          {success && <div className="text-success mb-2">¡Cita creada exitosamente!</div>}
        </form>
        {/* Footer opcional */}
        <ModalFooter onSave={() => setIsOpen(false)} saveLabel="Cerrar" />
      </div>
    </Modal>
  );
}