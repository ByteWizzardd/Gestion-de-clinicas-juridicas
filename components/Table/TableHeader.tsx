type TableHeaderProps = {
    title: string[];
    selectable?: boolean;
    onSelectAll?: (checked: boolean) => void;
    allSelected?: boolean;
};

export function TableHeader({ title, selectable, onSelectAll, allSelected }: TableHeaderProps) {
    return (
        <thead>
            <tr>
                {selectable && (
                    <th className="py-2.5 px-3 w-12 bg-primary rounded-l-full">
                        <div className="flex justify-center items-center">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                checked={allSelected}
                                onChange={(e) => onSelectAll?.(e.target.checked)}
                            />
                        </div>
                    </th>
                )}
                {title.map((col, idx) => (
                    <th
                        key={idx}
                        className={`text-base font-medium py-2.5 px-3 text-on-primary bg-primary whitespace-nowrap text-center
                            ${!selectable && idx === 0 ? 'rounded-l-full' : ''}
                        `}
                    >
                        {col}
                    </th>
                ))}
                {/* Encabezado para la columna de acciones */}
                <th
                    className="text-base font-medium py-2.5 px-3 text-on-primary bg-primary whitespace-nowrap text-center rounded-r-full"
                >
                    Acciones
                </th>
            </tr>
        </thead>
    );
}

