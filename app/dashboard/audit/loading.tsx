'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import AuditRecordCardSkeleton from '@/components/ui/skeletons/AuditRecordCardSkeleton';
import CaseTools from '@/components/CaseTools/CaseTools';
import { Layers } from 'lucide-react';

export default function AuditLoading() {
    return (
        <div className="p-4">
            {/* Título */}
            <h1 className="text-4xl m-3 font-semibold font-primary">Auditoría del Sistema</h1>
            <p className="mb-6 ml-3">Registro completo de todas las acciones realizadas en el sistema</p>

            {/* Barra de búsqueda y filtros (real) */}
            <div className="mb-6">
                <CaseTools
                    searchValue=""
                    onSearchChange={() => { }}
                    searchPlaceholder="Buscar en logs..."
                    nucleoFilter=""
                    onNucleoChange={() => { }}
                    nucleoLabel="Módulo"
                    nucleoAllLabel="Todos los módulos"
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

            {/* Cards skeleton (misma estructura que los módulos de auditoría) */}
            <div className="m-3 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <AuditRecordCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
