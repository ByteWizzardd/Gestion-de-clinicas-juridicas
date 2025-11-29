type TableRowProps<T> = {
    data: T;
    rowIndex: number; 
};

export function TableRow<T extends Record<string, unknown>>({ data, rowIndex }: TableRowProps<T>) {
    const cells = Object.values(data);
    return (
        <tr className={`border-none ${rowIndex % 2 === 1 ? 'bg-on-primary-light' : ''}`}>
            {cells.map((cell, index) => (
                <td
                    key={index}
                    className={`py-3 sm:py-3.5 text-center flex-1 text-sm sm:text-base px-3
                        ${rowIndex % 2 === 1 && index === 0 ? 'rounded-l-xl' : ''}
                    `}
                >
                    <span className="truncate block">{String(cell)}</span>
                </td>
            ))}
            {/* Nueva columna de acciones*/}
            {/* No hay necesidad de crear una columna separada para acciones, y cuando 
            se le agrega datos, se coloca automaticamente la imagen del svg*/}
            <td
                className={`py-3 sm:py-3.5 text-center flex-1 px-3
                    ${rowIndex % 2 === 1 ? 'rounded-r-xl' : ''}
                `}
            >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" 
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                        className="bg-on-primary-dots icon icon-tabler icons-tabler-outline icon-tabler-dots mx-auto text-on-primary cursor-pointer rounded-full sm:w-6 sm:h-6">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    </svg>
            </td>
        </tr>
    );
}