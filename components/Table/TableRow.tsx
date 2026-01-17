import React, { JSX } from 'react';
import ActionMenu from '@/components/ui/ActionMenu';

// Helper function to format cell values
function formatCellValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '-';
    }

    if (typeof value === 'boolean') {
        return value ? 'Sí' : 'No';
    }

    if (value instanceof Date) {
        return value.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    if (typeof value === 'string') {
        // Check if it's a date string in ISO format
        const dateRegex = /^\d{4}-\d{2}-\d{2}/;
        if (dateRegex.test(value)) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
        }
    }

    return String(value);
}

type TableRowAction<T> = {
    label: string | JSX.Element | ((data: T) => string | JSX.Element);
    onClick: (data: T) => void;
};

type TableRowProps<T> = {
    data: T;
    rowIndex: number;
    onView?: (data: T) => void;
    onEdit?: (data: T) => void;
    onDelete?: (data: T) => void;
    actions?: TableRowAction<T>[];
    hideEdit?: (data: T) => boolean;
    hideDelete?: (data: T) => boolean;
    renderRowActions?: (data: T) => React.ReactNode;
    selectable?: boolean;
    isSelected?: boolean;
    onSelect?: (checked: boolean) => void;
};

export function TableRow<T extends Record<string, unknown>>({ 
    data, 
    rowIndex, 
    onView, 
    onEdit, 
    onDelete, 
    actions, 
    hideEdit, 
    hideDelete, 
    renderRowActions,
    selectable,
    isSelected,
    onSelect
}: TableRowProps<T>) {
    const cells = Object.values(data);
    const shouldHideEdit = hideEdit ? hideEdit(data) : false;
    const shouldHideDelete = hideDelete ? hideDelete(data) : false;
    return (
        <tr className={`border-none flex items-center ${rowIndex % 2 === 1 ? 'bg-on-primary-light' : ''} ${isSelected ? 'bg-primary/5' : ''}`}>
            {selectable && (
                <td className={`py-4 sm:py-5 text-center px-3 w-12 flex justify-center items-center ${rowIndex % 2 === 1 ? 'rounded-l-xl' : ''}`}>
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        checked={isSelected}
                        onChange={(e) => onSelect?.(e.target.checked)}
                    />
                </td>
            )}
            {cells.map((cell, index) => (
                <td
                    key={index}
                    className={`py-4 sm:py-5 text-center flex-1 text-base px-3 min-w-0
                        ${rowIndex % 2 === 1 && index === 0 && !selectable ? 'rounded-l-xl' : ''}
                    `}
                >
                    <span className="truncate block" title={formatCellValue(cell)}>{formatCellValue(cell)}</span>
                </td>
            ))}
            <td
                className={`py-4 sm:py-5 text-center flex-1 px-3
                    ${rowIndex % 2 === 1 ? 'rounded-r-xl' : ''}
                `}
            >
                <div className="flex justify-center">
                    {(shouldHideEdit && shouldHideDelete && !actions && !renderRowActions) ? null : (
                        renderRowActions ? renderRowActions(data) : (
                            <ActionMenu
                                onView={onView ? () => onView(data) : undefined}
                                onEdit={!shouldHideEdit && onEdit ? () => onEdit(data) : undefined}
                                onDelete={!shouldHideDelete && onDelete ? () => onDelete(data) : undefined}
                                customActions={actions
                                    ?.map(action => {
                                        const label = typeof action.label === 'function' ? action.label(data) : action.label;
                                        return {
                                            label,
                                            onClick: () => action.onClick(data)
                                        };
                                    })
                                }
                            />
                        )
                    )}
                </div>
            </td>
        </tr>
    );
}