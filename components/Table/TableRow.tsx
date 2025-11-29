import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';

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
                    className={`py-4 sm:py-5 text-center flex-1 text-sm sm:text-base px-3
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
                className={`py-4 sm:py-5 text-center flex-1 px-3
                    ${rowIndex % 2 === 1 ? 'rounded-r-xl' : ''}
                `}
            >
                    <EllipsisHorizontalIcon className="bg-on-primary-dots mx-auto text-on-primary cursor-pointer rounded-full w-5 h-5 sm:w-6 sm:h-6" />
            </td>
        </tr>
    );
}