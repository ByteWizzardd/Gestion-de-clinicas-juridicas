'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import Search from '@/components/CaseTools/search';
import { ArrowDown } from 'lucide-react';
import Filter from '@/components/CaseTools/Filter';

export default function AuditModuleSkeleton({
    tabs,
    title,
    description,
    showHeaderSkeleton = false,
    searchPlaceholder = "Buscar por usuario, acción o detalle...",
    showSortButton = true
}: {
    tabs?: string[];
    title?: string;
    description?: string;
    showHeaderSkeleton?: boolean;
    searchPlaceholder?: string;
    showSortButton?: boolean;
}) {
    return (
        <div className="w-full">
            {/* Header - Solo se muestra si se pasa título/descripción o si se pide explícitamente el skeleton */}
            {(title || description || showHeaderSkeleton) && (
                <div className="mb-4 md:mb-6 mt-4">
                    {title ? (
                        <h1 className="text-4xl m-3 font-semibold font-primary text-[var(--foreground)] transition-colors">{title}</h1>
                    ) : showHeaderSkeleton ? (
                        <div className="m-3">
                            <Skeleton width="40%" height={36} borderRadius="8px" />
                        </div>
                    ) : null}
                    {description ? (
                        <p className="mb-6 ml-3 text-[var(--card-text-muted)] transition-colors">{description}</p>
                    ) : showHeaderSkeleton ? (
                        <div className="ml-3 mb-6">
                            <Skeleton width="60%" height={16} borderRadius="6px" />
                        </div>
                    ) : null}
                </div>
            )}
            {/* Tabs */}
            {tabs && tabs.length > 0 && (
                <div className="w-full">
                    <div className="border-b border-[var(--card-border)] mb-4 sm:mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-[var(--card-border)] scrollbar-track-transparent transition-colors">
                        <div className="flex gap-1 w-full min-w-max">
                            {tabs.map((tab, idx) => (
                                <button
                                    key={idx}
                                    className={`
                    px-4 sm:px-4 md:px-6 py-2 sm:py-3 text-sm sm:text-sm md:text-base font-medium whitespace-nowrap flex-none
                    border-b-2 transition-colors duration-200 cursor-not-allowed
                    ${idx === 0
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-[var(--card-text-muted)]'
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
            {(!tabs || tabs.length === 0) && <div className="mt-4">{renderInner()}</div>}
        </div>
    );

    function renderInner() {
        return (
            <div className="w-full">
                <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full px-3 mb-4 md:mb-6">
                    <div className="w-full sm:flex-1 sm:min-w-0">
                        <Search value="" onChange={() => { }} placeholder={searchPlaceholder} />
                    </div>
                    <div className="flex w-full sm:w-auto gap-3 sm:gap-4 items-center shrink-0 justify-start sm:justify-end">
                        {showSortButton && (
                            <button
                                type="button"
                                className="h-10 px-4 cursor-not-allowed rounded-full bg-transparent border border-primary text-[var(--foreground)] flex items-center justify-center gap-1.5 whitespace-nowrap opacity-50 transition-colors"
                                disabled
                            >
                                <ArrowDown className="w-[18px] h-[18px] text-[var(--card-text-muted)]" />
                                <span className="text-base text-center">Más reciente</span>
                            </button>
                        )}
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
