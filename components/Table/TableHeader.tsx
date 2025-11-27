type TableHeaderProps = {
    title: string[];
};

export function TableHeader({ title }: TableHeaderProps) {
    return (
    <>
        <thead className="bg-primary">
            <tr>
                {title.map((col, idx) => (
                    <th
                        key={idx}
                        className="text-xl font-medium py-3 px-4 first:rounded-l-full text-on-primary"
                    > 
                        {col}
                    </th>
                ))}
                {/* Encabezado para la columna de acciones */}
                <th
                    className="text-xl font-medium py-3 px-4 last:rounded-r-full text-on-primary"
                >
                    Acciones
                </th>
            </tr>
        </thead>
    </>
    );
}

