'use client';

import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';

export default function UsersLoading() {
    return (
        <>
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold font-primary">Usuarios</h1>
                <p className="mb-6 ml-3">
                    Administración de usuarios del sistema: estudiantes, profesores y coordinadores
                </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 w-full px-3">
                <div className="flex-1 min-w-0">
                    <CaseTools
                        searchValue=""
                        onSearchChange={() => { }}
                        searchPlaceholder="Buscar usuario..."
                        estatusFilter=""
                        onEstatusChange={() => { }}
                        estatusOptions={[
                            { value: 'Estudiante', label: 'Estudiante' },
                            { value: 'Profesor', label: 'Profesor' },
                            { value: 'Coordinador', label: 'Coordinador' },
                        ]}
                        tramiteFilter=""
                        onTramiteChange={() => { }}
                        tramiteOptions={[
                            { value: 'Habilitado', label: 'Habilitados' },
                            { value: 'Deshabilitado', label: 'Deshabilitados' },
                        ]}
                        nucleoFilter=""
                        onNucleoChange={() => { }}
                        nucleoLabel="Semestre"
                        nucleoAllLabel="Todos los semestres"
                        nucleoOptions={[]}
                    />
                </div>
                <div className="flex gap-3 sm:gap-4 items-center shrink-0">
                    {/* Gestión en lote */}
                    <div className="h-10 px-4 flex items-center cursor-pointer justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-full font-medium whitespace-nowrap">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                        </svg>
                        <span>Gestión en lote</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    {/* Registrar Usuario */}
                    <div className="h-10 px-4 flex items-center cursor-pointer justify-center gap-2 bg-primary text-white rounded-full font-medium whitespace-nowrap">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Registrar Usuario</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="mt-10"></div>

            <div className="px-3">
                <TableSkeleton columns={5} rows={10} />
            </div>
        </>
    );
}
