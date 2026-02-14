'use client';

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton para la lista de casos del dashboard.
 * Simula tarjetas de caso con icono, título, badge, y metadata.
 */
export default function CasosListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-3 w-full">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl p-4 border border-gray-200"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Skeleton width={16} height={16} borderRadius="4px" />
                                <Skeleton width={80} height={16} borderRadius="6px" />
                                <Skeleton width={60} height={20} borderRadius="9999px" />
                            </div>
                            <Skeleton width="60%" height={14} borderRadius="6px" className="mb-1" />
                            <Skeleton width="45%" height={12} borderRadius="6px" />
                        </div>
                        <Skeleton width={70} height={22} borderRadius="9999px" />
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1">
                            <Skeleton width={16} height={16} borderRadius="4px" />
                            <Skeleton width={100} height={12} borderRadius="6px" />
                        </div>
                        <div className="flex items-center gap-1">
                            <Skeleton width={16} height={16} borderRadius="4px" />
                            <Skeleton width={80} height={12} borderRadius="6px" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
