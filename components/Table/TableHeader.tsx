type TableHeaderProps = {
    title: string[];
    selectable?: boolean;
    onSelectAll?: (checked: boolean) => void;
    allSelected?: boolean;
};

export function TableHeader({ title, selectable, onSelectAll, allSelected }: TableHeaderProps) {
    return (
        <>
            <thead className="bg-primary rounded-full flex">
                <tr className="flex w-full items-center">
                    {selectable && (
                        <th className="py-2.5 px-3 flex justify-center items-center w-12">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                checked={allSelected}
                                onChange={(e) => onSelectAll?.(e.target.checked)}
                            />
                        </th>
                    )}
                    {title.map((col, idx) => (
                        <th
                            key={idx}
                            className="text-base font-medium py-2.5 px-3 text-on-primary whitespace-nowrap text-center flex-1"
                        >
                            {col}
                        </th>
                    ))}
                    {/* Encabezado para la columna de acciones */}
                    <th
                        className="text-base font-medium py-2.5 px-3 text-on-primary whitespace-nowrap text-center flex-1"
                    >
                        Acciones
                    </th>
                </tr>
            </thead>
        </>
    );
}

