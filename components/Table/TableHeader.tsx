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
                        className="text-2xl font-medium py-3 px-4 first:rounded-l-3xl text-on-primary"
                    > 
                        {col}
                    </th>
                ))}
                {/* Encabezado para la columna de acciones */}
                <th
                    className="text-2xl font-medium py-3 px-4 last:rounded-r-3xl text-on-primary"
                >
                    Acciones
                </th>
            </tr>
        </thead>
    </>
    );
}

