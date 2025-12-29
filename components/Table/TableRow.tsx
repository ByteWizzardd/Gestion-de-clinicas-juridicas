import ActionMenu from '@/components/ui/ActionMenu';

type TableRowProps<T> = {
    data: T;
    rowIndex: number;
    onView?: (data: T) => void;
    onEdit?: (data: T) => void;
    onDelete?: (data: T) => void;
};

export function TableRow<T extends Record<string, unknown>>({ data, rowIndex, onView, onEdit, onDelete }: TableRowProps<T>) {
    const cells = Object.values(data);
    return (
        <tr className={`border-none flex ${rowIndex % 2 === 1 ? 'bg-on-primary-light' : ''}`}>
            {cells.map((cell, index) => (
                <td
                    key={index}
                    className={`py-4 sm:py-5 text-center flex-1 text-base px-3 min-w-0
                        ${rowIndex % 2 === 1 && index === 0 ? 'rounded-l-xl' : ''}
                    `}
                >
                    <span className="truncate block" title={String(cell)}>{String(cell)}</span>
                </td>
            ))}
            {/* Nueva columna de acciones*/}
            {/* No hay necesidad de crear una columna separada para acciones, y cuando 
            se le agrega datos, se coloca automaticamente la imagen del svg*/}
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
                    />
                </div>
            </td>
        </tr>
    );
}