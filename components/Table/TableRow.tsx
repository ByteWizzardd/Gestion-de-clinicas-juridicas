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

    // Helper function to format cell values
    const formatCellValue = (cell: unknown): string => {
        // Format booleans as Sí/No
        if (typeof cell === 'boolean') {
            return cell ? 'Sí' : 'No';
        }

        // Format Date objects as DD/MM/AAAA
        if (cell instanceof Date && !isNaN(cell.getTime())) {
            const day = String(cell.getDate()).padStart(2, '0');
            const month = String(cell.getMonth() + 1).padStart(2, '0');
            const year = cell.getFullYear();
            return `${day}/${month}/${year}`;
        }

        // Format dates as DD/MM/AAAA
        if (typeof cell === 'string') {
            // Check if it's a date string (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
            const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.*)?$/;
            if (dateRegex.test(cell)) {
                const date = new Date(cell);
                if (!isNaN(date.getTime())) {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                }
            }
        }

        return String(cell);
    };

    return (
        <tr className={`border-none flex ${rowIndex % 2 === 1 ? 'bg-on-primary-light' : ''}`}>
            {cells.map((cell, index) => (
                <td
                    key={index}
                    className={`py-4 sm:py-5 text-center flex-1 text-base px-3 min-w-0
                        ${rowIndex % 2 === 1 && index === 0 ? 'rounded-l-xl' : ''}
                    `}
                >
                    <span className="truncate block" title={formatCellValue(cell)}>{formatCellValue(cell)}</span>
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