'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';
import { Layers } from 'lucide-react';

export default function AuditLoading() {
    return (
        <div className="w-full animate-pulse">
            {/* Título */}
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary text-neutral-300">Auditoría del Sistema</h1>
                <p className="mb-6 ml-3 text-neutral-400">Registro completo de todas las acciones realizadas en el sistema</p>
            </div>

            <div className="px-0">
                {/* Tabs Skeleton */}
                <div className="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
                    <div className="flex gap-1 w-full">
                        <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 border-b-2 border-primary">
                            <Skeleton className="h-5 w-16 sm:w-20 rounded" />
                        </div>
                        <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 border-b-2 border-transparent">
                            <Skeleton className="h-5 w-16 sm:w-20 rounded" />
                        </div>
                    </div>
                </div>

                {/* Barra de búsqueda y filtros (real) */}
                <div className="mb-6">
                    <CaseTools
                        searchValue=""
                        onSearchChange={() => { }}
                        searchPlaceholder="Cargando filtros..."
                        nucleoFilter=""
                        onNucleoChange={() => { }}
                        nucleoLabel="Módulo"
                        nucleoAllLabel="Cargando..."
                        nucleoOptions={[]}
                        nucleoIcon={Layers}
                        operacionFilter=""
                        onOperacionChange={() => { }}
                        operacionOptions={[]}
                        estadoCivilFilter=""
                        onEstadoCivilChange={() => { }}
                        estadoCivilLabel="Usuarios"
                        estadoCivilOptions={[]}
                        showDateRange={true}
                        fechaInicio=""
                        fechaFin=""
                        onFechaInicioChange={() => { }}
                        onFechaFinChange={() => { }}
                        sortFilter="desc"
                        onSortChange={() => { }}
                        sortLabel="Orden"
                        sortOptions={[
                            { value: 'desc', label: 'Más reciente' },
                            { value: 'asc', label: 'Más antiguo' }
                        ]}
                    />
                </div>

                {/* Cards skeleton */}
                <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <AuditRecordCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
