'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

interface DropdownMenuProps {
  trigger: ReactNode | ((isOpen: boolean) => ReactNode);
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  menuClassName?: string;
  onOpenChange?: (isOpen: boolean) => void;
  disabled?: boolean;
}

export default function DropdownMenu({
  trigger,
  children,
  align = 'left',
  className = '',
  menuClassName = '',
  onOpenChange,
  disabled = false
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const [hasModal, setHasModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  // Detectar si el dropdown está dentro de un modal al montarse
  const [isInsideModal, setIsInsideModal] = useState(false);
  
  useEffect(() => {
    // Verificar si el trigger está dentro de un modal
    if (triggerRef.current) {
      const parentModal = triggerRef.current.closest('[role="dialog"]') || 
                          triggerRef.current.closest('[aria-modal="true"]') ||
                          triggerRef.current.closest('[data-modal]');
      setIsInsideModal(!!parentModal);
    }
  }, []);

  // Detectar NUEVOS modales y cerrar el dropdown automáticamente
  // Solo cerrar si el dropdown NO está dentro del modal que se detecta
  useEffect(() => {
    if (!isOpen) return;
    
    // Si el dropdown está dentro de un modal, no cerrarlo por detección de modales
    if (isInsideModal) {
      setHasModal(false);
      return;
    }

    const checkForNewModal = () => {
      const modal = document.querySelector('[role="dialog"]') || 
                    document.querySelector('[aria-modal="true"]');
      
      if (modal) {
        setHasModal(true);
        setIsOpen(false);
        onOpenChange?.(false);
      } else {
        setHasModal(false);
      }
    };

    const observer = new MutationObserver((mutations) => {
      // Solo verificar si se agregaron nuevos nodos
      const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);
      if (hasNewNodes) {
        checkForNewModal();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [isOpen, onOpenChange, isInsideModal]);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 300;
      // Usar el ancho del trigger como referencia, con un mínimo estimado
      const estimatedMenuWidth = Math.max(rect.width, 200);

      const shouldOpenUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      setOpenUpward(shouldOpenUp);

      let leftPosition = rect.left;
      
      // Calcular posición según el align
      if (align === 'right') {
        // Alinear desde el borde derecho del trigger hacia la izquierda
        leftPosition = rect.right - estimatedMenuWidth;
        // Asegurar que no se salga por la izquierda
        if (leftPosition < 8) {
          leftPosition = 8;
        }
        // Si aún se sale por la derecha, ajustar desde la derecha del trigger
        if (leftPosition + estimatedMenuWidth > window.innerWidth - 8) {
          leftPosition = Math.max(8, window.innerWidth - estimatedMenuWidth - 8);
        }
      } else if (align === 'center') {
        // Centrar respecto al trigger
        leftPosition = rect.left + (rect.width / 2) - (estimatedMenuWidth / 2);
        // Ajustar si se sale por los bordes
        if (leftPosition < 8) {
          leftPosition = 8;
        }
        if (leftPosition + estimatedMenuWidth > window.innerWidth - 8) {
          leftPosition = window.innerWidth - estimatedMenuWidth - 8;
        }
      } else {
        // align === 'left' (default)
        // Alinear desde el borde izquierdo del trigger
        leftPosition = rect.left;
        // Asegurar que no se salga por la derecha de la pantalla
        if (leftPosition + estimatedMenuWidth > window.innerWidth - 8) {
          leftPosition = window.innerWidth - estimatedMenuWidth - 8;
        }
        // Asegurar que no se salga por la izquierda
        leftPosition = Math.max(8, leftPosition);
      }

      setCoords({
        top: shouldOpenUp ? rect.top : rect.bottom,
        left: leftPosition,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, align]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        // No cerrar si el click es en un submenú (elementos con z-index mayor)
        const target = event.target as HTMLElement;
        const submenu = target.closest('[data-submenu]');
        if (submenu) {
          return;
        }
        
        // Cerrar si el click es en un modal
        const modal = target.closest('[role="dialog"]') || target.closest('.modal') || target.closest('[data-modal]');
        if (modal) {
          setIsOpen(false);
          onOpenChange?.(false);
          return;
        }
        
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Usar un pequeño delay para evitar cierres inmediatos
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onOpenChange]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <div onClick={handleToggle} className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
        {typeof trigger === 'function' ? trigger(isOpen) : trigger}
      </div>

      {mounted && isOpen && createPortal(
        <AnimatePresence>
          <motion.div 
            ref={menuRef} 
            initial={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: openUpward ? coords.top - 4 : coords.top + 4,
              left: coords.left,
              width: coords.width,
              zIndex: isInsideModal ? 99999 : 9999,
              transform: openUpward ? 'translateY(-100%)' : undefined
            }}
            className={menuClassName}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              // Cerrar si se hace clic en un botón, a menos que tenga data-keep-open
              const clickedButton = target.closest('button');
              if (clickedButton && !clickedButton.hasAttribute('data-keep-open')) {
                setIsOpen(false);
                onOpenChange?.(false);
              }
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
