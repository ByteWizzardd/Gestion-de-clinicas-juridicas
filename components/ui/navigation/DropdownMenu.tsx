'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';

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
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar el estado externo si se proporciona onOpenChange
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  // Calcular posición para el Portal
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 350; // Altura estimada

      const shouldOpenUp = (spaceBelow < menuHeight && spaceAbove > spaceBelow) || (spaceAbove > spaceBelow && spaceBelow < 400);
      setOpenUpward(shouldOpenUp);

      // Usar coordenadas relativas al viewport para position: fixed
      setCoords({
        top: shouldOpenUp ? rect.top : rect.bottom,
        left: rect.left,
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
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const alignStyles: Record<string, any> = {
    left: { left: coords.left },
    right: { left: coords.left + coords.width, transform: 'translateX(-100%)' },
    center: { left: coords.left + coords.width / 2, transform: 'translateX(-50%)' }
  };

  const triggerElement = typeof trigger === 'function' ? trigger(isOpen) : trigger;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className="cursor-pointer"
      >
        {triggerElement}
      </div>

      {mounted && isOpen && createPortal(
        <AnimatePresence>
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: openUpward ? coords.top - 8 : coords.top + 8,
              // Para align="right", usamos right en lugar de left+translateX para evitar conflicto con motion
              ...(align === 'right'
                ? { right: window.innerWidth - coords.left - coords.width }
                : align === 'center'
                  ? { left: coords.left + coords.width / 2, transform: 'translateX(-50%)' }
                  : { left: coords.left }
              ),
              ...(openUpward && { transform: 'translateY(-100%)' }),
              zIndex: 9999,
              pointerEvents: 'auto',
            }}
            className={menuClassName}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const clickedButton = target.closest('button');
              if (clickedButton) {
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

