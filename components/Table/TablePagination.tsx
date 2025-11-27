type TablePaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export function TablePagination({ currentPage, totalPages, onPageChange }: TablePaginationProps) {
    // Genera un array con los números de página
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav aria-label="pagination" className="flex justify-end gap-10 items-center mr-40 mt-5">
        <span className="flex items-center gap-2">
            Mostrar
            <select
                className="border-2 rounded-lg h-8 w-11 border-on-border focus:active:hover:border-on-border text-center"
                value={currentPage}
                onChange={e => onPageChange(Number(e.target.value))}
            >
                {pages.map(page => (
                    <option key={page} value={page}>
                        {page}
                    </option>
                ))}
            </select>
        </span>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous Page"
            >
                {/* svg de flecha izquierda */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: "var(--primary)" }}
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-left hover:bg-primary-hover hover:rounded-full"
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
            >
                {/* svg de flecha derecha */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: "var(--primary)" }}
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-left hover:bg-primary-hover hover:rounded-full"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 12l14 0" />
                    <path d="M13 18l6 -6" />
                    <path d="M13 6l6 6" />
                </svg> 
            
            </button>
        </nav>
    );
}
