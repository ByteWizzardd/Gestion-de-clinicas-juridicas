'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

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
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

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

      {isOpen && (
        <div 
          ref={menuRef} 
          className={`absolute ${alignClasses[align]} mt-2 z-50 ${menuClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

