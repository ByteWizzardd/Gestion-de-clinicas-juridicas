type TableContainerProps = {
    children: React.ReactNode;
}

export const TableContainer = ({ children }: TableContainerProps) => {
    return (
        <table className="w-full font-secondary flex flex-col gap-2">
            {children}
        </table>
    );
}