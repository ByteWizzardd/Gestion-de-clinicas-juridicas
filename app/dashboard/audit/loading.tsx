'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import Search from '@/components/CaseTools/search';
import { ArrowDown } from 'lucide-react';

export default function GenericAuditLoading() {
    return (
        <div className="w-full animate-pulse">
            {/* Tabs Skeleton */}
            <div className="px-0">
                <div className="flex items-center border-b border-gray-200 mb-4 sm:mb-6">
                    <div className="flex gap-1 w-full min-w-max">
                        <div className="px-4 sm:px-4 md:px-6 py-2 sm:py-3 border-b-2 border-primary">
                            <Skeleton width={80} height={20} borderRadius="4px" />
                        </div>
                        <div className="px-4 sm:px-4 md:px-6 py-2 sm:py-3 border-b-2 border-transparent">
                            <Skeleton width={80} height={20} borderRadius="4px" />
                        </div>
                    </div>
                </div>

                {/* Filters Toolbar Skeleton */}
                <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full px-3 mb-4 md:mb-6">
                    <div className="w-full sm:flex-1 sm:min-w-0">
                        <Search
                            value=""
                            onChange={() => { }}
                            placeholder="Cargando..."
                        />
                    </div>
                    <div className="flex w-full sm:w-auto gap-3 sm:gap-4 items-center shrink-0 justify-start sm:justify-end">
                        <button
                            type="button"
                            className="h-10 px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap opacity-50 cursor-not-allowed"
                        >
                            <ArrowDown className="w-4 h-4 text-[#414040]" />
                            <span className="text-base">Más reciente</span>
                        </button>
                        <div className="h-10 w-24 rounded-full border border-primary opacity-50 flex items-center justify-center">
                            <Skeleton width={40} height={16} borderRadius="4px" />
                        </div>
                    </div>
                </div>

                {/* Audit Cards Skeleton list */}
                <div className="space-y-3 px-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <AuditRecordCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
