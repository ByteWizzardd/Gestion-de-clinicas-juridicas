'use client';

import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';

export default function CasesLoading() {
    return (
        <div>
            <div className="px-1">
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
                />
            </div>
            <div className="mt-10"></div>

            <div className="min-h-[400px] px-3 animate-pulse">
                <TableSkeleton columns={6} rows={10} />
            </div>
        </div>
    );
}
