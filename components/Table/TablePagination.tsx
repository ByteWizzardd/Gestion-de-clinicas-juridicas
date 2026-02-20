import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

type TablePaginationProps = {
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
};

/**
 * Genera el rango de páginas visibles con puntos suspensivos.
 * Muestra un rango más amplio de números para un desplazamiento más rápido.
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
    // Si hay 15 páginas o menos, mostrarlas todas.
    if (totalPages <= 15) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [];

    // Siempre mostrar las primeras 2 páginas
    pages.push(1);
    pages.push(2);

    if (currentPage > 6) {
        pages.push('...');
    }

    // Calcular el rango dinámico alrededor de la actual (4 a cada lado para que sea largo)
    let start = Math.max(3, currentPage - 4);
    let end = Math.min(totalPages - 2, currentPage + 4);

    // Ajustar para que siempre se vea una cantidad consistente de números
    if (currentPage <= 6) {
        end = 11;
    } else if (currentPage > totalPages - 6) {
        start = totalPages - 10;
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (currentPage < totalPages - 5) {
        pages.push('...');
    }

    // Siempre mostrar las últimas 2 páginas
    pages.push(totalPages - 1);
    pages.push(totalPages);

    return pages;
}

export function TablePagination({ currentPage, totalPages, rowsPerPage, onPageChange, onRowsPerPageChange }: TablePaginationProps) {
    const rowsPerPageOptions = [5, 10, 15, 25, 50];
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
        <nav aria-label="pagination" className="w-full mt-8 px-2 select-none flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Espaciador para centrar la paginación en pantallas grandes */}
            <div className="hidden lg:block lg:flex-1"></div>

            {/* Barra de paginación centrada y ancha */}
            <div className="flex items-center justify-center gap-2 order-1 lg:order-2">
                {/* Botón anterior */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 sm:p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-primary hover:text-primary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-100 disabled:hover:text-neutral-600"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 shadow-sm rounded-2xl">
                    {pageNumbers.map((page, index) =>
                        page === '...' ? (
                            <span
                                key={`dots-${index}`}
                                className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-neutral-400 text-sm font-bold"
                            >
                                ···
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-xs sm:text-sm rounded-xl transition-all duration-300 cursor-pointer
                                    ${page === currentPage
                                        ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30 scale-105'
                                        : 'text-neutral-500 hover:bg-primary-light hover:text-primary font-medium'
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                {/* Botón siguiente */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 sm:p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-primary hover:text-primary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-100 disabled:hover:text-neutral-600"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Selector de filas por página (alineado a la derecha en pantallas grandes) */}
            <div className="flex justify-center lg:justify-end lg:flex-1 w-full lg:w-auto order-2 lg:order-3">
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                    <span className="text-[10px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider">Filas</span>
                    <div className="relative flex items-center">
                        <select
                            className="appearance-none bg-transparent border-none pr-6 text-sm focus:outline-none focus:ring-0 cursor-pointer text-neutral-700 font-bold"
                            value={rowsPerPage}
                            onChange={e => onRowsPerPageChange(Number(e.target.value))}
                        >
                            {rowsPerPageOptions.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-0 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
                    </div>
                </div>
            </div>
        </nav>
    );
}