'use client';

import { Skeleton } from '@/components/ui/Skeleton';

interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

// Anchos variados para simular contenido realista en cada celda
const CELL_WIDTHS = ['45%', '70%', '55%', '60%', '50%', '65%', '40%', '75%'];

/**
 * Skeleton que replica fielmente la estructura del componente Table.
 * - Header con bg-primary y esquinas redondeadas
 * - Filas con alternancia de color (bg-on-primary-light en impares)
 * - Columna de acciones con ícono circular
 * - Paginación inferior
 */
export default function TableSkeleton({ columns, rows = 10 }: TableSkeletonProps) {
    return (
        <>
            <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <table className="w-full font-secondary border-separate border-spacing-x-0 border-spacing-y-2 min-w-[800px]">
                    {/* ─── Header ─────────────────────────────── */}
                    <thead>
                        <tr>
                            {Array.from({ length: columns }).map((_, i) => (
                                <th
                                    key={i}
                                    className={`py-2.5 px-3 bg-primary ${i === 0 ? 'rounded-l-full' : ''}`}
                                >
                                    <div className="flex justify-center">
                                        <Skeleton
                                            width="55%"
                                            height={16}
                                            borderRadius="6px"
                                            style={{
                                                background: 'rgba(255,255,255,0.25)',
                                                animation: 'none',
                                            }}
                                        />
                                    </div>
                                </th>
                            ))}
                            {/* Columna de acciones */}
                            <th className="py-2.5 px-3 bg-primary rounded-r-full">
                                <div className="flex justify-center">
                                    <Skeleton
                                        width="45%"
                                        height={16}
                                        borderRadius="6px"
                                        style={{
                                            background: 'rgba(255,255,255,0.25)',
                                            animation: 'none',
                                        }}
                                    />
                                </div>
                            </th>
                        </tr>
                    </thead>

                    {/* ─── Rows ───────────────────────────────── */}
                    <tbody className="border-t-2 border-t-transparent">
                        {Array.from({ length: rows }).map((_, rowIdx) => {
                            const isOdd = rowIdx % 2 === 1;
                            const rowBgClass = isOdd ? 'bg-[var(--table-row-even-bg)]' : '';
                            return (
                                <tr
                                    key={rowIdx}
                                    className="border-none"
                                >
                                    {Array.from({ length: columns }).map((_, colIdx) => {
                                        // Variar el ancho de cada celda para que se vea orgánico
                                        const widthIdx = (rowIdx * 3 + colIdx) % CELL_WIDTHS.length;
                                        return (
                                            <td
                                                key={colIdx}
                                                className={`py-4 sm:py-5 px-3 transition-colors ${rowBgClass} ${isOdd && colIdx === 0 ? 'rounded-l-xl' : ''}`}
                                            >
                                                <div className="flex justify-center">
                                                    <Skeleton
                                                        width={CELL_WIDTHS[widthIdx]}
                                                        height={12}
                                                        borderRadius="6px"
                                                    />
                                                </div>
                                            </td>
                                        );
                                    })}
                                    {/* Columna de acciones — 3 dot icon */}
                                    <td className={`py-4 sm:py-5 px-3 transition-colors ${rowBgClass} ${isOdd ? 'rounded-r-xl' : ''}`}>
                                        <div className="flex justify-center">
                                            <div className="flex items-center gap-[3px]">
                                                {[0, 1, 2].map((d) => (
                                                    <Skeleton
                                                        key={d}
                                                        width={5}
                                                        height={5}
                                                        borderRadius="50%"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ─── Pagination ─────────────────────────── */}
            <div className="w-full mt-8 px-2 flex flex-col lg:flex-row items-center justify-between gap-6 opacity-60">
                <div className="hidden lg:block lg:flex-1"></div>

                <div className="flex items-center justify-center gap-2 order-1 lg:order-2">
                    <Skeleton width={36} height={36} borderRadius="12px" />
                    <div className="flex items-center gap-1 p-1 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm rounded-2xl hidden sm:flex transition-colors">
                        <Skeleton width={32} height={32} borderRadius="12px" />
                        <Skeleton width={32} height={32} borderRadius="12px" />
                        <Skeleton width={32} height={32} borderRadius="12px" />
                    </div>
                    <Skeleton width={36} height={36} borderRadius="12px" />
                </div>

                <div className="flex justify-center lg:justify-end lg:flex-1 w-full lg:w-auto order-2 lg:order-3">
                    <div className="flex items-center gap-3 bg-[var(--card-bg)] px-4 py-2 rounded-full shadow-sm border border-[var(--card-border)] transition-colors">
                        <Skeleton width={30} height={12} borderRadius="6px" />
                        <Skeleton width={40} height={20} borderRadius="6px" />
                    </div>
                </div>
            </div>
        </>
    );
}
