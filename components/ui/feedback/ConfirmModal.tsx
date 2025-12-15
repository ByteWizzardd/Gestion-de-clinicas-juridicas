'use client';

import Modal from './Modal';
import Button from '../Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Sí',
  cancelLabel = 'No',
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-normal text-foreground mb-4">{title}</h2>
        <p className="text-base text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <Button variant="outline" size="xl" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="primary" size="xl" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

