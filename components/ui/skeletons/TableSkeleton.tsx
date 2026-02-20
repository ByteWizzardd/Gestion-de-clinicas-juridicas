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
        <div className="w-full font-secondary flex flex-col gap-2">
            {/* ─── Header ─────────────────────────────── */}
            <div
                className="rounded-full flex items-center"
                style={{ backgroundColor: 'var(--primary)' }}
            >
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={i} className="flex-1 flex justify-center py-2.5 px-3">
                        <Skeleton
                            width="55%"
                            height={16}
                            borderRadius="6px"
                            style={{
                                background: 'rgba(255,255,255,0.18)',
                                animation: 'none',
                            }}
                        />
                    </div>
                ))}
                {/* Columna de acciones */}
                <div className="flex-1 flex justify-center py-2.5 px-3">
                    <Skeleton
                        width="45%"
                        height={16}
                        borderRadius="6px"
                        style={{
                            background: 'rgba(255,255,255,0.18)',
                            animation: 'none',
                        }}
                    />
                </div>
            </div>

            {/* ─── Rows ───────────────────────────────── */}
            <div className="border-t-2 border-t-transparent flex flex-col">
                {Array.from({ length: rows }).map((_, rowIdx) => {
                    const isOdd = rowIdx % 2 === 1;
                    return (
                        <div
                            key={rowIdx}
                            className={`flex items-center ${isOdd ? 'bg-on-primary-light rounded-xl' : ''
                                }`}
                        >
                            {Array.from({ length: columns }).map((_, colIdx) => {
                                // Variar el ancho de cada celda para que se vea orgánico
                                const widthIdx = (rowIdx * 3 + colIdx) % CELL_WIDTHS.length;
                                return (
                                    <div
                                        key={colIdx}
                                        className="flex-1 py-4 sm:py-5 px-3 flex justify-center"
                                    >
                                        <Skeleton
                                            width={CELL_WIDTHS[widthIdx]}
                                            height={12}
                                            borderRadius="6px"
                                        />
                                    </div>
                                );
                            })}
                            {/* Columna de acciones — 3 dot icon */}
                            <div className="flex-1 py-4 sm:py-5 px-3 flex justify-center">
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
                        </div>
                    );
                })}
            </div>

            {/* ─── Pagination ─────────────────────────── */}
            <div className="flex justify-end items-center gap-6 mt-3 pr-3 sm:mr-10 lg:mr-40">
                <div className="flex items-center gap-2">
                    <Skeleton width={55} height={12} borderRadius="6px" />
                    <Skeleton width={70} height={36} borderRadius="9999px" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton width={36} height={36} borderRadius="50%" />
                    <Skeleton width={36} height={36} borderRadius="50%" />
                </div>
            </div>
        </div>
    );
}
