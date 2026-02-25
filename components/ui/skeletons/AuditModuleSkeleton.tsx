'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import Search from '@/components/CaseTools/search';
import { ArrowDown } from 'lucide-react';
import Filter from '@/components/CaseTools/Filter';

export default function AuditModuleSkeleton({ tabs }: { tabs?: string[] }) {
    return (
        <div className="w-full">
            {/* Tabs */}
            {tabs && tabs.length > 0 && (
                <div className="w-full">
                    <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        <div className="flex gap-1 w-full min-w-max">
                            {tabs.map((tab, idx) => (
                                <button
                                    key={idx}
                                    className={`
                    px-4 sm:px-4 md:px-6 py-2 sm:py-3 text-sm sm:text-sm md:text-base font-medium whitespace-nowrap flex-none
                    border-b-2 transition-colors duration-200 cursor-not-allowed
                    ${idx === 0
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 opacity-70'
                                        }
                  `}
                                    disabled
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 min-h-0">
                        {renderInner()}
                    </div>
                </div>
            )}
            {(!tabs || tabs.length === 0) && renderInner()}
        </div>
    );

    function renderInner() {
        return (
            <div className="w-full mt-4">
                <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full px-3 mb-4 md:mb-6">
                    <div className="w-full sm:flex-1 sm:min-w-0">
                        <Search value="" onChange={() => { }} placeholder="Buscar..." />
                    </div>
                    <div className="flex w-full sm:w-auto gap-3 sm:gap-4 items-center shrink-0 justify-start sm:justify-end">
                        <button
                            type="button"
                            className="h-10 px-4 cursor-not-allowed rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap opacity-50"
                            disabled
                        >
                            <ArrowDown className="w-[18px] h-[18px] text-[#414040]" />
                            <span className="text-base text-center">Más reciente</span>
                        </button>
                        <Filter
                            nucleoFilter=""
                            onNucleoChange={() => { }}
                            nucleoLabel="Usuario"
                            nucleoOptions={[]}
                            nucleoAllLabel="Todos los usuarios"
                            tramiteOptions={[]}
                            fechaInicio=""
                            fechaFin=""
                            onFechaInicioChange={() => { }}
                            onFechaFinChange={() => { }}
                            showDateRange={true}
                            estatusOptions={[]}
                            estatusFilter={''}
                            onEstatusChange={() => { }}
                        />
                    </div>
                </div>
                <div className="space-y-3 px-3 min-h-[400px]">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <AuditRecordCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }
}
