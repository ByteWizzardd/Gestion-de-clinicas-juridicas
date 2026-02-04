import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

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
                <div className="relative h-9 min-w-[70px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] rounded-3xl bg-white">
                    <select
                        className="appearance-none w-full h-full bg-transparent border-none rounded-3xl py-1 pl-4 pr-8 text-sm focus:outline-none focus:ring-0 cursor-pointer text-neutral-800/90 font-normal"
                        value={rowsPerPage}
                        onChange={e => onRowsPerPageChange(Number(e.target.value))}
                    >
                        {rowsPerPageOptions.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-neutral-700" />
                    </div>
                </div>
            </span>
            <div className="flex items-center gap-3 sm:gap-6">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous Page"
                    className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronLeft
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
                        <ChevronRight
                            style={{ color: "var(--primary)" }}
                            className="w-8 h-8 sm:w-10 sm:h-10"
                        />
                    </div>
                </button>
            </div>
        </nav>
    );
}