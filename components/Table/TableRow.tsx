type TableRowProps<T> = {
    data: T;
};

export function TableRow<T extends Record<string, unknown>>({ data }: TableRowProps<T>) {
    return (
        <tr className="border-none ">
            {Object.values(data).map((cell, index) => (
                <td key={index} className="py-5 text-center flex-1">
                    {String(cell)}
                </td>
            ))}
        </tr>
    );
}