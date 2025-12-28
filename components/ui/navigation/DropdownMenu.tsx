'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Sincronizar el estado externo si se proporciona onOpenChange
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  // Calcular si debe abrirse hacia arriba
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 300; // Altura aproximada del menú

      // Si hay menos espacio abajo que la altura del menú, y hay más espacio arriba
      if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
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

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
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

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            ref={menuRef} 
            initial={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute ${alignClasses[align]} ${openUpward ? 'bottom-full mb-2' : 'mt-2'} z-[100] ${menuClassName}`}
            onClick={(e) => {
              // Si el clic es en un botón dentro del menú, cerrar el dropdown inmediatamente
              const target = e.target as HTMLElement;
              const clickedButton = target.closest('button');
              if (clickedButton) {
                // Cerrar inmediatamente para que la animación de salida se ejecute
                setIsOpen(false);
                onOpenChange?.(false);
              }
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

