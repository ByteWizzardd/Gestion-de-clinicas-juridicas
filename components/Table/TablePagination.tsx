type TablePaginationProps = {
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
};

export function TablePagination({ currentPage, totalPages, rowsPerPage, onPageChange, onRowsPerPageChange }: TablePaginationProps) {
    // Opciones de filas por página
    const rowsPerPageOptions = [5, 10, 15, 25, 50];

    return (
        <nav aria-label="pagination" className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 sm:gap-6 items-center sm:mr-10 lg:mr-40 mt-4 px-3 sm:px-0">
        <span className="flex items-center gap-2 text-xs sm:text-sm">
            Mostrar
            <select
                className="border-2 rounded-lg h-7 w-14 border-on-border focus:active:hover:border-on-border text-center text-xs"
                value={rowsPerPage}
                onChange={e => onRowsPerPageChange(Number(e.target.value))}
            >
                {rowsPerPageOptions.map(option => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </span>
        <div className="flex items-center gap-3 sm:gap-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous Page"
                className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {/* svg de flecha izquierda */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: "var(--primary)" }}
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-left hover:bg-primary-hover hover:rounded-full sm:w-10 sm:h-10"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 12l14 0" />
                    <path d="M5 12l6 6" />
                    <path d="M5 12l6 -6" />
                </svg>

            </button>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
                className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {/* svg de flecha derecha */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: "var(--primary)" }}
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-left hover:bg-primary-hover hover:rounded-full sm:w-10 sm:h-10"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 12l14 0" />
                    <path d="M13 18l6 -6" />
                    <path d="M13 6l6 6" />
                </svg> 
            
            </button>
        </div>
        </nav>
    );
}
