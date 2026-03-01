'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'custom';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export default function Modal({
  children,
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap básico
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isOpen]);

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
    custom: '', // Para permitir max-w personalizado
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={handleOverlayClick}
          aria-hidden="true"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className={`
                bg-[var(--card-bg)] rounded-xl shadow-xl w-full relative ${sizeStyles[size]} 
                flex flex-col my-auto border border-[var(--card-border)]
                ${className}
              `}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Botón de cerrar flotante */}
            {showCloseButton && !title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] rounded-md transition-colors z-50 cursor-pointer"
                aria-label="Cerrar modal"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {/* Header con título (solo si se proporciona title) */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)] bg-[var(--card-bg)] rounded-t-xl sticky top-0 z-20">
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-[var(--foreground)]"
                >
                  {title}
                </h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] rounded-md transition-colors cursor-pointer"
                    aria-label="Cerrar modal"
                    type="button"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={`flex-1 ${title ? '' : 'p-6'} flex flex-col min-h-0`}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-[var(--card-border)] px-6 py-4 bg-[var(--ui-bg-muted)] rounded-b-xl sticky bottom-0 z-20 transition-colors">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}