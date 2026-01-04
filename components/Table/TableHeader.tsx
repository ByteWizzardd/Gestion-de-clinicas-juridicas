type TableHeaderProps = {
    title: string[];
};

export function TableHeader({ title }: TableHeaderProps) {
    return (
        <>
            <thead className="bg-primary rounded-full flex">
                <tr className="flex w-full">
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

