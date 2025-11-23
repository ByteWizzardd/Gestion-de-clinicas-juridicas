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
                        className="text-2xl font-medium py-3 px-4 first:rounded-l-3xl last:rounded-r-3xl"
                        style={{ color: "var(--on-primary)"}}
                    >
                        {col}
                    </th>
                ))}
            </tr>
        </thead>
    </>
    );
}

