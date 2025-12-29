'use client';

import Modal from './Modal';
import Button from '../Button';
import { ReactNode } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode; // Cambiado de string a ReactNode
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
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
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-normal text-foreground mb-4">{title}</h2>
        <div className="text-base text-gray-700 mb-6">{message}</div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" size="xl" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="primary" size="xl" onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

