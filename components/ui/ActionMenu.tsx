'use client';
import { JSX } from 'react';
import { MoreHorizontal, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import DropdownMenu from './navigation/DropdownMenu';

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
  variant?: 'horizontal' | 'vertical';
};

export default function ActionMenu({ onView, onEdit, onDelete, customActions, variant = 'horizontal' }: ActionMenuProps) {
  const handleAction = (action: () => void | undefined) => {
    if (action) {
      action();
    }
  };

  const hasActions = onView || onEdit || onDelete || (customActions && customActions.length > 0);

  if (!hasActions) return null;

  const trigger = () => (
    <div className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
      {variant === 'horizontal' ? (
        <MoreHorizontal className="bg-on-primary-dots mx-auto text-on-primary rounded-full w-5 h-5 sm:w-6 sm:h-6" />
      ) : (
        <MoreVertical className="text-gray-500 mx-auto w-5 h-5 sm:w-6 sm:h-6" />
      )}
    </div>
  );

  return (
    <DropdownMenu
      trigger={trigger}
      align="right"
      menuClassName="w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1"
    >
      <div className="flex flex-col">
        {onView && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onView);
              }}
              className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-gray-900 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
              Ver
            </button>
            {(onEdit || (customActions && customActions.length > 0) || onDelete) && (
              <div className="border-t border-gray-100 my-1"></div>
            )}
          </>
        )}

        {onEdit && (
          <>
            <button
              key="edit-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onEdit);
              }}
              className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-gray-900 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
              Editar
            </button>
            {((customActions && customActions.filter(action => action.label !== '' && action.label !== null).length > 0) || onDelete) && (
              <div className="border-t border-gray-100 my-1"></div>
            )}
          </>
        )}

        {customActions && customActions.filter(action => action.label !== '' && action.label !== null).map((action, idx) => {
          const isLast = idx === customActions.length - 1 && !onDelete;
          return (
            <div key={idx}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-yellow-600 flex items-center gap-3 transition-colors cursor-pointer"
              >
                {action.label}
              </button>
              {!isLast && idx < customActions.length - 1 && (
                <div className="border-t border-gray-100 my-1"></div>
              )}
              {idx === customActions.length - 1 && onDelete && (
                <div className="border-t border-gray-100 my-1"></div>
              )}
            </div>
          );
        })}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onDelete);
            }}
            className="group w-full px-4 py-2.5 text-left text-base text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
            Eliminar
          </button>
        )}
      </div>
    </DropdownMenu>
  );
}
