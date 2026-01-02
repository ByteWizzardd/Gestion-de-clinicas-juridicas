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
      <div className="bg-white p-12 relative">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-normal text-foreground mb-6">{title}</h2>
        <div className="text-base text-foreground mb-8">{message}</div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" size="xl" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} size="xl" onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

