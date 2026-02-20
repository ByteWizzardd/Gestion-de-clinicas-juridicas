type TableContainerProps = {
    children: React.ReactNode;
}

export const TableContainer = ({ children }: TableContainerProps) => {
    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <table className="w-full font-secondary border-separate border-spacing-y-2 min-w-[800px]">
                {children}
            </table>
        </div>
    );
}