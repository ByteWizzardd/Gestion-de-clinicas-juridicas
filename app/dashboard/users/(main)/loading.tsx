'use client';

import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';
import { UserX, Plus, ChevronDown } from 'lucide-react';

export default function UsersLoading() {
    return (
        <div className="animate-pulse">

            <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 w-full px-3 text-[var(--foreground)] transition-colors">
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
                    <div className="h-10 px-4 flex items-center cursor-pointer justify-center gap-2 bg-[var(--card-bg)] text-[var(--card-text)] border border-[var(--ui-border)] rounded-full shadow-sm font-medium whitespace-nowrap transition-colors">
                        <UserX className="w-5 h-5 text-[var(--card-text-muted)] transition-colors" />
                        <span className="text-[var(--card-text)]">Gestión en lote</span>
                        <ChevronDown className="w-4 h-4 text-[var(--card-text-muted)] transition-colors" strokeWidth={2.5} />
                    </div>
                    {/* Registrar Usuario */}
                    <div className="h-10 px-4 flex items-center cursor-pointer justify-center gap-2 bg-primary text-white rounded-full font-medium whitespace-nowrap shadow-sm hover:opacity-90 transition-all">
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        <span>Registrar Usuario</span>
                        <ChevronDown className="w-4 h-4 opacity-80" strokeWidth={2.5} />
                    </div>
                </div>
            </div>
            <div className="mt-10"></div>

            <div className="px-3">
                <TableSkeleton columns={5} rows={10} />
            </div>
        </div>
    );
}
