'use client';

import DatePicker from "../forms/DatePicker";
import { useState } from "react";
import Modal from "../ui/feedback/Modal";
import Select from "../forms/Select";

import ModalFooter from "../ui/ModalFooter";
import TextArea from "../forms/TextArea";

const casos = [
  { value: "1", label: "Caso 1" },
  { value: "2", label: "Caso 2" },

];

export function AppointmentModal() {
  const [date, setDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [SelectedCaseID, setSelectedCaseID] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

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
        <div className="font-primary grid grid-cols-1 gap-y-4 sm:gap-y-6 mb-6">
          <div>
            <Select
              label="Caso *"
              options={casos}
              value={SelectedCaseID}
              onChange={(e) => setSelectedCaseID(e.target.value)}
              required
              className="w-full"
            />
          </div>

            <label className="text-base font-primary font-normal text-foreground mb-1 block">Fecha de Encuentro <span className="text-danger">*</span></label>
            <DatePicker
              value={date ? date.toISOString().slice(0, 10) : ""}
              onChange={(value: string) => setDate(value ? new Date(value) : null)}
              required
            />

            <label className="text-base font-primary font-normal text-foreground mb-1 block">Fecha de Próxima cita</label>
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
                maxLength={5000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-right mt-1 select-none">
                {/*Esto de minimo y Máximo podemos generalizar*/}
                {notes.length}/500
              </div>
            </div>
          {/* Footer*/}
          <ModalFooter onSave={() => setIsOpen(false)} saveLabel="Guardar cita" />
        </div>
      </Modal>
  );
}