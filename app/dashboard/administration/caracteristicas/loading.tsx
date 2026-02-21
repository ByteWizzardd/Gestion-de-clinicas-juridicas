'use client';

import { Skeleton } from "@/components/ui/Skeleton";
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";
import CaseTools from "@/components/CaseTools/CaseTools";

export default function CatalogLoading() {
    return (
        <div className="w-full">
            {/* Search and Filters toolbar skeleton - Using real component for consistency */}
            {/* Not pulsing to feel "pre-loaded" */}
            <div className="px-1 mb-6">
                <CaseTools
                    addLabel="Cargando..."
                    searchValue=""
                    onSearchChange={() => { }}
                    onNucleoChange={() => { }}
                    searchPlaceholder="Buscar..."
                />
            </div>

            {/* Table Skeleton */}
            <div className="px-1 animate-pulse">
                <TableSkeleton columns={3} rows={10} />
            </div>
        </div>
    );
}