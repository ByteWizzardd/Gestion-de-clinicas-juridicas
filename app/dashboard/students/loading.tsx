'use client';

import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';

export default function StudentsLoading() {
    return (
        <>
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold text-[var(--foreground)] transition-colors" style={{ fontFamily: 'var(--font-league-spartan)' }}>Estudiantes</h1>
                <p className="mb-6 ml-3 text-sm sm:text-base text-[var(--card-text-muted)] transition-colors" style={{ fontFamily: 'var(--font-urbanist)' }}>
                    Visualización y gestión de estudiantes registrados en el sistema.
                </p>
            </div>

            <div className="px-3 md:px-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 w-full px-3">
                    <div className="flex-1 min-w-0">
                        <CaseTools
                            searchValue=""
                            onSearchChange={() => { }}
                            searchPlaceholder="Buscar estudiante..."
                            estatusFilter=""
                            onEstatusChange={() => { }}
                            estatusLabel="Estado"
                            estatusOptions={[
                                { value: 'Habilitado', label: 'Habilitado' },
                                { value: 'Deshabilitado', label: 'Deshabilitado' },
                            ]}
                            nucleoFilter=""
                            onNucleoChange={() => { }}
                            nucleoLabel="Tipo"
                            nucleoAllLabel="Todos los tipos"
                            nucleoOptions={[]}
                            tramiteFilter=""
                            onTramiteChange={() => { }}
                            tramiteOptions={[]}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-10"></div>

            <div className="m-3">
                <TableSkeleton columns={5} rows={10} />
            </div>
        </>
    );
}
