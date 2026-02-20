'use client';

import AuditEntityCardSkeleton from '@/components/ui/skeletons/AuditEntityCardSkeleton';
import Search from '@/components/CaseTools/search';

export default function AdministrationLoading() {
    return (
        <div className="space-y-6 animate-pulse">

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
