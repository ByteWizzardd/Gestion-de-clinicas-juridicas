'use client';

import AuditEntityCardSkeleton from '@/components/ui/skeletons/AuditEntityCardSkeleton';
import Search from '@/components/CaseTools/search';

export default function AdministrationLoading() {
    return (
        <div className="w-full space-y-6 overflow-x-hidden max-w-full">
            {/* Header */}
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl m-3 font-semibold font-primary">Administración</h1>
                <p className="mb-6 ml-3 text-base text-gray-500">Mantenimiento de los catálogos del sistema</p>
            </div>

            {/* Buscador (real) */}
            <div className="mb-6">
                <Search
                    value=""
                    onChange={() => { }}
                    placeholder="Buscar catálogo..."
                />
            </div>

            {/* Grid de cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <AuditEntityCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
