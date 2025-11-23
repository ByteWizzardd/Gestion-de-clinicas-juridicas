'use client';

import KPICard from './KPICard';
import {
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';

export default function KPIDashboard() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Casos Registrados y Demanda */}
            <KPICard
                title="Casos Registrados y Demanda"
                mainValue="125 casos"
                contextText="+15% vs. Periodo Anterior"
                detailText="Materia más común: Familiar (35%)"
                icon={<ChartBarIcon className="w-10 h-10" />}
                variant="success"
                trend="up"
                trendValue="+15%"
            />

            {/* Card 2: Casos en Riesgo */}
            <KPICard
                title="Casos en Riesgo"
                mainValue="12 Casos"
                mainLabel="Inactivos"
                contextText="Casos sin Acción registrada en más de 30 días o Estatus = En Pausa."
                icon={<ExclamationTriangleIcon className="w-10 h-10" />}
                variant="danger"
            />

            {/* Card 3: Acciones Ejecutadas */}
            <KPICard
                title="Acciones Ejecutadas"
                mainValue="587 acciones"
                contextText="Promedio por Caso: 4.7 Acciones"
                detailText="Total de acciones de seguimiento (Audiencia, citas)"
                icon={<CheckCircleIcon className="w-10 h-10" />}
                variant="default"
            />

            {/* Card 4: Tasa de Cierre Efectivo */}
            <KPICard
                title="Tasa de Cierre Efectivo (Éxito)"
                mainValue="75%"
                contextText="Casos Archivados: 94 | Pendientes de Cierre: 31"
                detailText="El principal indicador de cumplimiento. Porcentaje de casos concluidos satisfactoriamente sobre el total."
                icon={<TrophyIcon className="w-10 h-10" />}
                variant="success"
            />
        </div>
    );
}
