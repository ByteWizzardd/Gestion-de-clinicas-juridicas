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
        <>
          {/* Overlay con backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black/50 z-40"
            style={{ minHeight: '100vh', height: '100%' }}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-50 flex items-center justify-center p-4 pointer-events-none" style={{ minHeight: '100vh' }}>
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`
                bg-white rounded-xl shadow-xl w-full ${sizeStyles[size]} 
                pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden
                ${className}
              `}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
            >
              {/* Botón de cerrar flotante */}
              {showCloseButton && !title && (
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary hover:bg-red-100 rounded-md transition-colors z-10"
                  style={{ cursor: 'pointer' }}
                  aria-label="Cerrar modal"
                  type="button"
                >
                  <X className="w-6 h-6" style={{ pointerEvents: 'none' }} />
                </button>
              )}
              {/* Header con título (solo si se proporciona title) */}
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2
                    id="modal-title"
                    className="text-xl font-semibold text-foreground"
                  >
                    {title}
                  </h2>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-red-100 rounded-md transition-colors"
                      style={{ cursor: 'pointer' }}
                      aria-label="Cerrar modal"
                      type="button"
                    >
                      <X className="w-6 h-6" style={{ pointerEvents: 'none' }} />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className={`flex-1 ${title ? '' : 'p-6'} flex flex-col min-h-0`}>{children}</div>

              {/* Footer */}
              {footer && (
                <div className="border-t border-gray-200 p-6">{footer}</div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}