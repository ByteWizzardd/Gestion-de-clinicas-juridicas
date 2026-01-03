'use client';
import React, { useState, useRef, useEffect, JSX } from 'react';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';

type CustomAction = {
  label: string | JSX.Element;
  onClick: () => void;
};

type ActionMenuProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  customActions?: CustomAction[];
  itemId?: string | number;
};

export default function ActionMenu({ onView, onEdit, onDelete, customActions }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Verificar si hay espacio suficiente abajo
      const checkPosition = () => {
        if (buttonRef.current && menuRef.current) {
          const buttonRect = buttonRef.current.getBoundingClientRect();
          const menuHeight = menuRef.current.offsetHeight || 150; // Altura estimada del menú
          const spaceBelow = window.innerHeight - buttonRect.bottom;
          const spaceAbove = buttonRect.top;
          
          // Si no hay espacio abajo pero sí arriba, mostrar arriba
          if (spaceBelow < menuHeight + 10 && spaceAbove > menuHeight + 10) {
            setShowAbove(true);
          } else {
            setShowAbove(false);
          }
        }
      };
      
      // Verificar posición después de que el menú se renderice
      setTimeout(checkPosition, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void | undefined) => {
    if (action) {
      action();
      setIsOpen(false);
    }
  };

  const hasActions = onView || onEdit || onDelete || (customActions && customActions.length > 0);

  return (
    <div className="relative">
      <div ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
        <MoreHorizontal className="bg-on-primary-dots mx-auto text-on-primary rounded-full w-5 h-5 sm:w-6 sm:h-6" />
      </div>

      {isOpen && hasActions && (
        <div 
          ref={menuRef} 
          className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-30 py-1 ${
            showAbove ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {onView && (
            <>
              <button onClick={() => handleAction(onView)} className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-gray-900 flex items-center gap-3 transition-colors cursor-pointer">
                <Eye className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
                Ver
              </button>
              {(onEdit || onDelete) && (
                <div className="border-t border-gray-100 my-1"></div>
              )}
            </>
          )}
          {onEdit && (
            <>
              <button onClick={() => handleAction(onEdit)} className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-gray-900 flex items-center gap-3 transition-colors cursor-pointer">
                <Pencil className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
                Editar
              </button>
              {onDelete && (
                <div className="border-t border-gray-100 my-1"></div>
              )}
            </>
          )}
          {onDelete && (
            <button onClick={() => handleAction(onDelete)} className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer">
              <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
              Eliminar
            </button>
          )}
          {customActions && customActions.filter(action => action.label !== '' && action.label !== null).length > 0 && (
            <div className="border-t border-gray-100 my-1"></div>
          )}
          {customActions && customActions.filter(action => action.label !== '' && action.label !== null).map((action, idx) => {
            // Si el label es un elemento React (JSX.Element), renderizarlo directamente sin wrapper de button
            // para evitar anidar botones
            const isReactElement = typeof action.label !== 'string' && React.isValidElement(action.label);
            
            if (isReactElement) {
              return (
                <div key={idx} className="w-full">
                  {action.label}
                </div>
              );
            }
            
            // Si es un string, usar button como antes
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-yellow-600 flex items-center gap-3 transition-colors cursor-pointer"
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

