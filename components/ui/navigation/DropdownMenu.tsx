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
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, width: 0 });
  const [menuLeft, setMenuLeft] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [, setHasModal] = useState(false);
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

      const shouldOpenUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      setOpenUpward(shouldOpenUp);

      setCoords({
        top: shouldOpenUp ? rect.top : rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width
      });
    }
  };

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const recomputeMenuLeft = () => {
    if (!isOpen || !menuRef.current) return;

    const menuWidth = menuRef.current.getBoundingClientRect().width;
    if (!menuWidth || !Number.isFinite(menuWidth)) return;

    const margin = 8; // px
    const maxLeft = Math.max(margin, window.innerWidth - menuWidth - margin);

    let nextLeft = coords.left;
    if (align === 'right') {
      nextLeft = coords.right - menuWidth;
    } else if (align === 'center') {
      nextLeft = coords.left + coords.width / 2 - menuWidth / 2;
    }

    nextLeft = clamp(nextLeft, margin, maxLeft);
    setMenuLeft(prev => (prev !== null && Math.abs(prev - nextLeft) < 0.5 ? prev : nextLeft));
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
    if (!isOpen) {
      setMenuLeft(null);
      return;
    }

    // Esperar a que el portal pinte el menú para medirlo
    const raf = window.requestAnimationFrame(() => {
      recomputeMenuLeft();
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [isOpen, coords.left, coords.right, coords.width, align]);

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: openUpward ? coords.top - 4 : coords.top + 4,
              left: menuLeft ?? (align === 'center' ? coords.left + coords.width / 2 : coords.left),
              right: 'auto',
              // Solo setear width si menuClassName NO define un ancho (w-*)
              ...(menuClassName && /w-\[?\d/.test(menuClassName) ? {} : { width: coords.width }),
              zIndex: isInsideModal ? 99999 : 9999,
              transform: align === 'center'
                ? (openUpward ? 'translate(-50%, -100%)' : 'translate(-50%, 0)')
                : (openUpward ? 'translateY(-100%)' : undefined)
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
