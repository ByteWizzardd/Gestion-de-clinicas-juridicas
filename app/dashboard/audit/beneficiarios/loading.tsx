'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import Search from '@/components/CaseTools/search';
import { ArrowDown } from 'lucide-react';

export default function BeneficiariosAuditLoading() {
    return (
        <div className="w-full">
            {/* Real Static Tabs */}
            <div className="flex items-center border-b border-gray-200 mb-4 sm:mb-6">
                <div className="flex gap-1 w-full min-w-max">
                    <button className="px-4 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink border-b-2 border-primary text-primary transition-colors cursor-pointer">
                        Creados
                    </button>
                    <button className="px-4 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                        Actualizados
                    </button>
                    <button className="px-4 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                        Eliminados
                    </button>
                </div>
            </div>

            {/* Filters Toolbar - Static */}
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full mb-4 md:mb-6">
                <div className="w-full xl:flex-1 min-w-0">
                    <Search
                        value=""
                        onChange={() => { }}
                        placeholder="Buscar..."
                    />
                </div>
                <div className="flex w-full xl:w-auto gap-3 sm:gap-4 items-center shrink-0">
                    <button
                        type="button"
                        className="h-10 px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap opacity-50 cursor-not-allowed"
                    >
                        <ArrowDown className="w-4 h-4 text-[#414040]" />
                        <span className="text-base">Más reciente</span>
                    </button>
                </div>
            </div>

            {/* Audit Cards Skeleton list - Animated */}
            <div className="space-y-3 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                    <AuditRecordCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
