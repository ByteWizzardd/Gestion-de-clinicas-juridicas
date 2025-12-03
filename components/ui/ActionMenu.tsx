'use client';
import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';

type ActionMenuProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  itemId?: string | number;
};

export default function ActionMenu({ onView, onEdit, onDelete }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const hasActions = onView || onEdit || onDelete;

  return (
    <div className="relative">
      <div ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
        <MoreHorizontal className="bg-on-primary-dots mx-auto text-on-primary rounded-full w-5 h-5 sm:w-6 sm:h-6" />
      </div>

      {isOpen && hasActions && (
        <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-1">
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
        </div>
      )}
    </div>
  );
}

