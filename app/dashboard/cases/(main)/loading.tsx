'use client';

import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';
import { RefreshCw } from 'lucide-react';

export default function CasesLoading() {
    return (
        <div>
            <div className="px-1 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                    <CaseTools
                        addLabel="Añadir Caso"
                        searchValue=""
                        onSearchChange={() => { }}
                        searchPlaceholder="Buscar caso..."
                        nucleoFilter=""
                        onNucleoChange={() => { }}
                        tramiteFilter=""
                        onTramiteChange={() => { }}
                        estatusFilter=""
                        onEstatusChange={() => { }}
                        showDateRange={true}
                        showCasosAsignados={true}
                        mostrarPendientesReasignacion={true}
                    />
                </div>

                <div className="flex shrink-0">
                    <div
                        className="h-10 px-4 rounded-full border border-red-500 text-red-600
                                   dark:text-red-400 flex items-center gap-2 whitespace-nowrap
                                   text-base opacity-70"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Cierre de semestre
                    </div>
                </div>
            </div>
            <div className="mt-10"></div>

            <div className="min-h-[400px] px-3 animate-pulse">
                <TableSkeleton columns={6} rows={10} />
            </div>
        </div>
    );
}
