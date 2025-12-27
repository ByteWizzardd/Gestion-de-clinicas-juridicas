import React, { JSX } from 'react';
import ActionMenu from '@/components/ui/ActionMenu';

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
};

export function TableRow<T extends Record<string, unknown>>({ data, rowIndex, onView, onEdit, onDelete, actions }: TableRowProps<T>) {
    const cells = Object.values(data);
    return (
        <tr className={`border-none ${rowIndex % 2 === 1 ? 'bg-on-primary-light' : ''}`}>
            {cells.map((cell, index) => (
                <td
                    key={index}
                    className={`py-4 sm:py-5 text-center flex-1 text-base px-3
                        ${rowIndex % 2 === 1 && index === 0 ? 'rounded-l-xl' : ''}
                    `}
                >
                    <span className="truncate block">{String(cell)}</span>
                </td>
            ))}
            <td
                className={`py-4 sm:py-5 text-center flex-1 px-3
                    ${rowIndex % 2 === 1 ? 'rounded-r-xl' : ''}
                `}
            >
                <div className="flex justify-center">
                    <ActionMenu
                        onView={onView ? () => onView(data) : undefined}
                        onEdit={onEdit ? () => onEdit(data) : undefined}
                        onDelete={onDelete ? () => onDelete(data) : undefined}
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
                </div>
            </td>
        </tr>
    );
}