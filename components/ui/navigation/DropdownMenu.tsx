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

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 350;

      const shouldOpenUp = (spaceBelow < menuHeight && spaceAbove > spaceBelow) || (spaceAbove > spaceBelow && spaceBelow < 400);
      setOpenUpward(shouldOpenUp);

      // Offset adicional hacia la izquierda para align="left"
      const leftOffset = align === 'left' ? -24 : 0;
      const minLeft = 8;

      setCoords({
        top: shouldOpenUp ? rect.top + window.scrollY : rect.bottom + window.scrollY,
        left: Math.max(minLeft, rect.left + window.scrollX + leftOffset),
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
        
        setIsOpen(false);
        onOpenChange?.(false);
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
            initial={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: openUpward ? coords.top - 8 : coords.top + 8,
              ...alignStyles[align],
              width: align === 'center' ? 'auto' : coords.width,
              zIndex: 9999,
              pointerEvents: 'auto',
              transform: openUpward ? `${alignStyles[align].transform || ''} translateY(-100%)` : alignStyles[align].transform
            }}
            className={menuClassName}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const clickedButton = target.closest('button[data-close-menu]');
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
