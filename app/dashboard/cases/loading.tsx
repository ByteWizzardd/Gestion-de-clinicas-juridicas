'use client';

import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';

export default function CasesLoading() {
    return (
        <>
            <div className="mb-4 md:mb-6 mt-4">
                <div>
                    <h1 className="text-4xl m-3 font-semibold font-primary">Casos</h1>
                    <p className="mb-6 ml-3">Listado y gestión de todos los casos registrados.</p>
                </div>
            </div>

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

            <div className="min-h-[400px] px-3">
                <TableSkeleton columns={6} rows={10} />
            </div>
        </>
    );
}
