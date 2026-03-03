'use client';

import Modal from './Modal';
import Button from '../Button';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motive?: string) => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  confirmVariant?: 'primary' | 'danger';
  showMotive?: boolean;
  motiveValue?: string;
  onMotiveChange?: (value: string) => void;
  motivePlaceholder?: string;
  motiveRequired?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Sí',
  cancelLabel = 'No',
  disabled,
  confirmVariant = 'primary',
  showMotive = false,
  motiveValue = '',
  onMotiveChange,
  motivePlaceholder = 'Describe el motivo...',
  motiveRequired = true,
}: ConfirmModalProps) {
  const isConfirmDisabled = disabled || (showMotive && motiveRequired && !motiveValue.trim());

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="lg">
      <div className="bg-[var(--card-bg)] p-6 relative transition-colors">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] rounded-full transition-colors z-10 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-normal text-[var(--foreground)] mb-4 pr-8" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {title}
        </h2>
        <div className="text-base text-[var(--card-text-muted)] mb-6 leading-relaxed">
          {message}
        </div>

        {showMotive && (
          <div className="flex flex-col gap-1 mb-8">
            <label className="text-base font-normal text-foreground mb-1">
              Motivo
            </label>
            <textarea
              className="w-full p-4 rounded-lg border border-transparent bg-[var(--input-bg)]
                         focus:outline-none focus:ring-1 focus:ring-primary
                         text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] resize-none transition-colors"
              rows={4}
              maxLength={250}
              value={motiveValue}
              onChange={(e) => onMotiveChange?.(e.target.value)}
              placeholder={motivePlaceholder}
            />
            <div className="text-right text-xs text-[var(--card-text-muted)] mt-1 transition-colors">
              {motiveValue.length} / 250 caracteres
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm} disabled={isConfirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );

  function handleConfirm() {
    onConfirm(motiveValue);
  }
}

