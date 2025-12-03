import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

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
        <span className="flex items-center gap-2 text-base">
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
                className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeftIcon 
                    style={{ color: "var(--primary)" }}
                        className="w-8 h-8 sm:w-10 sm:h-10"
                    />
                </div>
            </button>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
                className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronRightIcon 
                    style={{ color: "var(--primary)" }}
                        className="w-8 h-8 sm:w-10 sm:h-10"
                    />
                </div>
            </button>
        </div>
        </nav>
    );
}
