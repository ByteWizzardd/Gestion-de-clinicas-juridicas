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
}

export default function DropdownMenu({
  trigger,
  children,
  align = 'left',
  className = '',
  menuClassName = '',
  onOpenChange
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

  // Detectar modales y cerrar el dropdown automáticamente
  useEffect(() => {
    if (!isOpen) return;

    const checkForModal = () => {
      const modal = document.querySelector('[role="dialog"]') || 
                    document.querySelector('[aria-modal="true"]') ||
                    document.querySelector('.fixed.z-50') ||
                    document.querySelector('[class*="backdrop"]');
      
      if (modal) {
        setHasModal(true);
        setIsOpen(false);
        onOpenChange?.(false);
      } else {
        setHasModal(false);
      }
    };

    const observer = new MutationObserver(() => {
      checkForModal();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'role', 'aria-modal', 'style']
    });

    // Verificar inmediatamente
    checkForModal();

    // También verificar cuando el body se bloquea
    const checkBodyOverflow = () => {
      if (document.body.style.overflow === 'hidden') {
        checkForModal();
      }
    };

    const styleObserver = new MutationObserver(checkBodyOverflow);
    styleObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    });

    return () => {
      observer.disconnect();
      styleObserver.disconnect();
    };
  }, [isOpen, onOpenChange]);

  const updatePosition = () => {
    if (triggerRef.current && menuRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 350;
      const menuWidth = 200; // Ancho estimado del menú

      const shouldOpenUp = (spaceBelow < menuHeight && spaceAbove > spaceBelow) || (spaceAbove > spaceBelow && spaceBelow < 400);
      setOpenUpward(shouldOpenUp);

      let leftPosition = rect.left + window.scrollX;
      
      if (align === 'left') {
        // Para align="left", posicionar desde el borde derecho del botón hacia la izquierda
        leftPosition = rect.right + window.scrollX - menuWidth;
        const spaceOnLeft = rect.left;
        const spaceOnRight = window.innerWidth - rect.right;
        
        // Si no hay espacio a la izquierda pero sí a la derecha, mostrar a la derecha
        if (spaceOnLeft < menuWidth && spaceOnRight > menuWidth) {
          leftPosition = rect.left + window.scrollX;
        } else {
          // Asegurar que no se salga por la izquierda
          leftPosition = Math.max(8, leftPosition);
        }
      } else if (align === 'right') {
        leftPosition = rect.left + rect.width + window.scrollX;
      } else if (align === 'center') {
        leftPosition = rect.left + rect.width / 2 + window.scrollX;
      }

      setCoords({
        top: shouldOpenUp ? rect.top + window.scrollY : rect.bottom + window.scrollY,
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
    setIsOpen(!isOpen);
  };

  const alignStyles: Record<string, any> = {
    left: { left: coords.left, transform: 'translateX(0)' },
    right: { left: coords.left, transform: 'translateX(-100%)' },
    center: { left: coords.left, transform: 'translateX(-50%)' }
  };

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <div onClick={handleToggle} className="cursor-pointer">
        {typeof trigger === 'function' ? trigger(isOpen) : trigger}
      </div>

      {mounted && isOpen && createPortal(
        <AnimatePresence>
          <motion.div 
            ref={menuRef} 
            initial={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: openUpward ? coords.top - 8 : coords.top + 8,
              ...alignStyles[align],
              width: align === 'center' ? 'auto' : coords.width,
              zIndex: hasModal ? 30 : 9999, // Reducir z-index cuando hay modal
              pointerEvents: hasModal ? 'none' : 'auto', // Deshabilitar interacciones cuando hay modal
              opacity: hasModal ? 0 : undefined, // Ocultar visualmente cuando hay modal
              transform: openUpward ? `${alignStyles[align].transform || ''} translateY(-100%)` : alignStyles[align].transform
            }}
            className={menuClassName}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const clickedButton = target.closest('button[data-close-menu]');
              if (clickedButton) {
                setIsOpen(false);
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
