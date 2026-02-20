'use client';

import { Plus, Calendar, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import DropdownMenu from '@/components/ui/navigation/DropdownMenu';
import { useState, useEffect } from 'react';

interface NewAppointmentButtonProps {
  onRegister: () => void;
  onSchedule: () => void;
  variant?: 'default' | 'icon';
  className?: string;
}

export default function NewAppointmentButton({
  onRegister,
  onSchedule,
  variant = 'default',
  className = '',
}: NewAppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar el dropdown cuando se detecta que un modal se ha abierto
  useEffect(() => {
    if (!isOpen) return;

    // Escuchar cambios en el DOM para detectar modales
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            const element = node as HTMLElement;
            // Verificar si el elemento o sus hijos son modales
            if (
              element.getAttribute('role') === 'dialog' ||
              element.getAttribute('aria-modal') === 'true' ||
              (element.classList.contains('fixed') && element.classList.contains('z-50')) ||
              element.querySelector('[role="dialog"]') ||
              element.querySelector('[aria-modal="true"]')
            ) {
              setIsOpen(false);
              return;
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'role', 'aria-modal']
    });

    // También verificar cuando el body se bloquea (indicador de modal)
    const checkBodyOverflow = () => {
      if (document.body.style.overflow === 'hidden') {
        const modal = document.querySelector('[role="dialog"]') ||
          document.querySelector('[aria-modal="true"]');
        if (modal) {
          setIsOpen(false);
        }
      }
    };

    const styleObserver = new MutationObserver(checkBodyOverflow);
    styleObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    });

    // Verificar inmediatamente
    checkBodyOverflow();

    return () => {
      observer.disconnect();
      styleObserver.disconnect();
    };
  }, [isOpen]);

  const triggerButton = (isOpenState: boolean) => {
    if (variant === 'icon') {
      return (
        <button
          type="button"
          className={`h-10 w-10 bg-primary cursor-pointer text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors ${className}`}
          aria-label="Nueva cita"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      );
    }

    return (
      <motion.button
        type="button"
        className={`h-10 px-4 flex items-center cursor-pointer justify-center gap-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors font-medium whitespace-nowrap ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="w-5 h-5" />
        <span>Nueva Cita</span>
      </motion.button>
    );
  };

  return (
    <DropdownMenu
      trigger={triggerButton}
      onOpenChange={setIsOpen}
      align="right"
      className="relative"
      menuClassName="bg-white border border-gray-300 rounded-2xl shadow-xl min-w-[200px] overflow-hidden py-2"
    >
      <div onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            // Cerrar inmediatamente
            setIsOpen(false);
            // Usar un microtask para asegurar que el estado se actualice primero
            Promise.resolve().then(() => {
              onSchedule();
            });
          }}
          className="w-full px-4 py-3 text-left text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3"
        >
          <Calendar className="w-5 h-5 text-primary" />
          <span>Programar cita</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            // Cerrar inmediatamente
            setIsOpen(false);
            // Usar un microtask para asegurar que el estado se actualice primero
            Promise.resolve().then(() => {
              onRegister();
            });
          }}
          className="w-full px-4 py-3 text-left text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3"
        >
          <FileText className="w-5 h-5 text-primary" />
          <span>Registrar cita</span>
        </button>
      </div>
    </DropdownMenu>
  );
}
