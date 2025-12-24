import React from "react";

interface ModalFooterProps {
  onSave: () => void;
  saveLabel?: string;
  disabled?: boolean;
}

export default function ModalFooter({
  onSave,
  saveLabel = "Guardar",
  disabled = false,
}: ModalFooterProps) {
  return (
    <div className="flex flex-col border-t border-background pt-6">
      <div className="flex justify-end">
        <button
          className="px-6 py-2 rounded-full bg-primary text-on-primary font-semibold text-lg hover:bg-primary-hover transition-colors shadow-md"
          onClick={onSave}
          type="button"
          disabled={disabled}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
