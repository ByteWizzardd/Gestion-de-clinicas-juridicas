type TableContainerProps = {
    children: React.ReactNode;
}

export const TableContainer = ({ children }: TableContainerProps) => {
    return (
        <table className="w-full table-fixed font-secondary border-collapse border-spacing-0" style={{ borderSpacing: 0 }}>
            {children}
        </table>
    );
}