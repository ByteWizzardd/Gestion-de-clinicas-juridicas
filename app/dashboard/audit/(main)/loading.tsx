import { Skeleton } from '@/components/ui/Skeleton';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';
import { Layers } from 'lucide-react';

export default function AuditLoading() {
    return (
        <div className="w-full">
            {/* Tabs Skeleton */}
            <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <div className="flex gap-1 w-full min-w-max">
                    <button className="px-4 sm:px-4 md:px-6 py-2 sm:py-3 text-sm sm:text-sm md:text-base font-medium whitespace-nowrap flex-none border-b-2 border-primary text-primary cursor-not-allowed" disabled>
                        General
                    </button>
                    <button className="px-4 sm:px-4 md:px-6 py-2 sm:py-3 text-sm sm:text-sm md:text-base font-medium whitespace-nowrap flex-none border-b-2 border-transparent text-gray-500 opacity-70 cursor-not-allowed" disabled>
                        Módulos
                    </button>
                </div>
            </div>

            {/* Content loading state */}
            <div className="mt-4 min-h-0">
                <div className="w-full">
                    {/* Barra de búsqueda y filtros (static pre-loaded state) */}
                    <div className="mb-4 md:mb-6">
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
                    <div className="space-y-3 px-1 md:px-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <AuditRecordCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
