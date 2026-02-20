'use client';

import { Skeleton } from "@/components/ui/Skeleton";
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";

export default function CatalogLoading() {
    return (
        <div className="w-full">
            {/* Header Skeleton */}
            <div className="mb-4 md:mb-6 mt-4">
                <div className="m-3">
                    <Skeleton width="40%" height={40} borderRadius="8px" />
                </div>
                <div className="mb-6 ml-3">
                    <Skeleton width="60%" height={20} borderRadius="4px" />
                </div>
            </div>

            {/* Back button skeleton if applicable, but generic is fine */}
            <div className="mb-4 px-3">
                <Skeleton width={150} height={32} borderRadius="8px" />
            </div>

            {/* Search and Filters toolbar skeleton */}
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full px-3 mb-6">
                <div className="flex-1 min-w-0">
                    <Skeleton width="100%" height={40} borderRadius="999px" />
                </div>
                <div className="flex gap-3">
                    <Skeleton width={120} height={40} borderRadius="999px" />
                    <Skeleton width={150} height={40} borderRadius="999px" />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="px-1">
                <TableSkeleton columns={5} rows={10} />
            </div>
        </div>
    );
}
