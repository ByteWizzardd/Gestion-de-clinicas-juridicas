'use client';

import { Skeleton } from "@/components/ui/Skeleton";
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";
import CaseTools from "@/components/CaseTools/CaseTools";

export default function CatalogLoading() {
    return (
        <div className="w-full">
            {/* Back button skeleton if applicable, but generic is fine */}
            <div className="mb-4 px-3 animate-pulse">
                <Skeleton width={150} height={32} borderRadius="8px" />
            </div>

            {/* Search and Filters toolbar skeleton - Using real component for consistency */}
            {/* Not pulsing to feel "pre-loaded" */}
            <div className="px-1 mb-6">
                <CaseTools
                    addLabel="Añadir..."
                    searchValue=""
                    onSearchChange={() => { }}
                    onNucleoChange={() => { }} // Triggers hasFilter
                    searchPlaceholder="Buscar..."
                />
            </div>

            {/* Table Skeleton */}
            <div className="px-1 animate-pulse">
                <TableSkeleton columns={5} rows={10} />
            </div>
        </div>
    );
}
