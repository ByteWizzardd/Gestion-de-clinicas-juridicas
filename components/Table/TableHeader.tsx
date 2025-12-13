import React from 'react';

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
                        className="text-base font-medium py-2.5 px-3 first:rounded-l-full text-on-primary whitespace-nowrap"
                    > 
                        {col}
                    </th>
                ))}
                {/* Encabezado para la columna de acciones */}
                <th
                    className="text-base font-medium py-2.5 px-3 last:rounded-r-full text-on-primary whitespace-nowrap"
                >
                    Acciones
                </th>
            </tr>
        </thead>
    </>
    );
}

