'use client';

import { Skeleton } from "@/components/ui/Skeleton";
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";
import CaseTools from "@/components/CaseTools/CaseTools";

export default function CatalogLoading() {
    return (
        <div className="w-full">
            {/* Search and Filters toolbar skeleton - Using real component for consistency */}
            {/* Not pulsing to feel "pre-loaded" */}
            <CaseTools
                    addLabel="Cargando..."
                    searchValue=""
                    onSearchChange={() => { }}
                    onMateriaChange={() => { }}
                    searchPlaceholder="Buscar..."
                />

            <div className="mt-10"></div>

            {/* Table Skeleton */}
            <div className="animate-pulse">
                <TableSkeleton columns={4} rows={10} />
            </div>
        </div>
    );
}
