type TableHeaderProps = {
    title: string[];
};

export function TableHeader({ title }: TableHeaderProps) {
    return (
        <table className="w-1/2 table-auto bg-primary rounded-3xl border-6 border-primary overflow-hidden">
            <thead>
                <tr>
                    {title.map((col, idx) => (
                        <th
                            key={idx}
                            className="font-urbanist text-2xl font-medium"
                            style={{ color: "var(--on-primary)" }}
                        >
                            {col}
                        </th>
                    ))}
                </tr>
            </thead>
        </table>
    );
}