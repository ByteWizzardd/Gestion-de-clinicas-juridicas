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
        <tr className="border-none">
            <td colSpan={100} className="p-0 pb-2">
                <div className={`rounded-3xl flex items-center ${rowIndex % 2 === 1 ? 'bg-on-primary-light' : 'bg-white'}`}>
                    {cells.map((cell, index) => (
                        <div
                            key={index}
                            className="py-4 sm:py-5 text-center flex-1 text-base px-3"
                        >
                            <span className="truncate block">{String(cell)}</span>
                        </div>
                    ))}
                    {/* Nueva columna de acciones*/}
                    <div className="py-4 sm:py-5 text-center flex-1 px-3">
                        <div className="flex justify-center">
                            <ActionMenu
                                onView={onView ? () => onView(data) : undefined}
                                onEdit={onEdit ? () => onEdit(data) : undefined}
                                onDelete={onDelete ? () => onDelete(data) : undefined}
                            />
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
}