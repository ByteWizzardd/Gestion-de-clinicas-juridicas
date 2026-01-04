'use client';

import Modal from './Modal';
import Button from '../Button';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  confirmVariant?: 'primary' | 'danger';
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
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="lg">
      <div className="bg-white p-6 relative">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-normal text-foreground mb-4 pr-8" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {title}
        </h2>
        <div className="text-base text-gray-600 mb-8 leading-relaxed">
          {message}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

