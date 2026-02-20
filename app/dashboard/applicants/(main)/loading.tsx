'use client';

import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';

export default function ApplicantsLoading() {
    return (
        <div>
            <div className="px-1">
                <CaseTools
                    addLabel="Añadir Solicitante"
                    searchValue=""
                    onSearchChange={() => { }}
                    searchPlaceholder="Buscar solicitantes..."
                    nucleoFilter=""
                    onNucleoChange={() => { }}
                    estadoCivilFilter=""
                    onEstadoCivilChange={() => { }}
                />
            </div>
            <div className="mt-10"></div>

            <div className="px-3 animate-pulse">
                <TableSkeleton columns={5} rows={10} />
            </div>
        </div>
    );
}
