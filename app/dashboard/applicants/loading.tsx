'use client';

import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';

export default function ApplicantsLoading() {
    return (
        <>
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Solicitantes</h1>
                <p className="mb-6 ml-3">Listado y búsqueda de todas las personas atendidas.</p>
            </div>

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

            <div className="px-3">
                <TableSkeleton columns={5} rows={10} />
            </div>
        </>
    );
}
