type TableHeaderProps = {
    title: string[];
};

export function TableHeader({ title }: TableHeaderProps) {
    return (
        <>
            <thead>
                <tr>
                    <th colSpan={100} className="p-0 pb-2">
                        <div className="bg-primary rounded-full flex items-center">
                            {title.map((col, idx) => (
                                <div
                                    key={idx}
                                    className="text-base font-medium py-2.5 px-3 text-on-primary whitespace-nowrap text-center flex-1"
                                >
                                    {col}
                                </div>
                            ))}
                            {/* Encabezado para la columna de acciones */}
                            <div className="text-base font-medium py-2.5 px-3 text-on-primary whitespace-nowrap text-center flex-1">
                                Acciones
                            </div>
                        </div>
                    </th>
                </tr>
            </thead>
        </>
    );
}


