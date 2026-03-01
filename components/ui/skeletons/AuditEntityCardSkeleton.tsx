'use client';

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton que imita la estructura del AuditEntityCard.
 * Replica la card con sombra, barra naranja lateral, icono de fondo, título, descripción y botón.
 */
export default function AuditEntityCardSkeleton() {
    return (
        <div className="bg-[var(--card-bg)] border-[var(--card-border)] border rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] relative overflow-hidden px-4 sm:px-6 md:px-8 py-4 md:py-5 min-h-[160px] md:min-h-[180px] flex flex-col w-full transition-colors">
            {/* Icono de fondo decorativo (shimmer circular grande) */}
            <div className="absolute top-2 w-full h-full flex items-center justify-center right-0 opacity-10">
                <Skeleton width={128} height={128} borderRadius="50%" />
            </div>

            {/* Título */}
            <div className="mb-1.5 relative z-10">
                <Skeleton width="55%" height={20} borderRadius="6px" />
            </div>

            {/* Descripción */}
            <div className="mb-3 relative z-10 grow">
                <Skeleton width="80%" height={12} borderRadius="6px" />
                <div className="mt-1.5">
                    <Skeleton width="60%" height={12} borderRadius="6px" />
                </div>
            </div>

            {/* Contador y botón */}
            <div className="flex items-center justify-between gap-2 relative z-10">
                <Skeleton width={48} height={28} borderRadius="8px" />
                <Skeleton width={100} height={32} borderRadius="8px" />
            </div>

            {/* Barra naranja lateral */}
            <div className="absolute top-4 sm:top-5 md:top-6 bottom-4 sm:bottom-5 md:bottom-6 left-2 md:left-3 w-0.5 md:w-1 bg-secondary/30 rounded-full z-10" />
        </div>
    );
}
