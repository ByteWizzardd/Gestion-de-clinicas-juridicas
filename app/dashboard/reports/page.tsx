'use client';

import { useState } from 'react';
import {
    DocumentTextIcon,
    ChartBarSquareIcon,
    UserCircleIcon,
    DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import ReportCard from '@/components/ui/ReportCard';
import FilterBar, { ReportFilters } from '@/components/reports/FilterBar';
import { ViewMode } from '@/components/ui/ViewSwitcher';
import DistributionChart from '@/components/reports/charts/DistributionChart';
import TopCasesChart from '@/components/reports/charts/TopCasesChart';
import KPIDashboard from '@/components/reports/KPIDashboard';
import {
    nucleoDistributionData,
    nucleoTopCasesData,
    distributionData,
    topCasesData
} from './mockData';

export default function ReportsPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('charts');
    const [filters, setFilters] = useState<ReportFilters>({
        dateRange: 'last-month',
        nucleo: 'all',
        term: 'all'
    });

    // Get filtered data based on selected nucleo
    const currentDistributionData = nucleoDistributionData[filters.nucleo] || distributionData;
    const currentTopCasesData = nucleoTopCasesData[filters.nucleo] || topCasesData;

    const handleGenerateReport = (reportType: string) => {
        console.log(`Generando reporte: ${reportType}`, { filters });
        // TODO: Implement actual report generation logic
        alert(`Generando ${reportType}...`);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl m-3 font-semibold font-primary">Reportes</h1>
                <p className="mb-6 ml-3 text-sm sm:text-base">Presentación de las métricas clave a través de gráficas y cuadros.</p>
            </div>

            {/* Report Generation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <ReportCard
                    title="Informe Global de Actividad"
                    description="Resumen de casos por TERM y Tipo de Caso en el rango de fecha seleccionado."
                    icon={<DocumentTextIcon className="w-7 h-7" />}
                    variant="primary"
                    onGenerate={() => handleGenerateReport('Informe Global de Actividad')}
                />
                <ReportCard
                    title="Reporte de Estatus de Casos"
                    description="Informe detallado que muestra el estatus de los casos clasificado por su estado."
                    icon={<ChartBarSquareIcon className="w-7 h-7" />}
                    variant="secondary"
                    onGenerate={() => handleGenerateReport('Reporte de Estatus de Casos')}
                />
                <ReportCard
                    title="Ficha Resumen del Solicitante"
                    description="Genera la ficha completa del cliente, usando solo la Cédula."
                    icon={<UserCircleIcon className="w-7 h-7" />}
                    variant="success"
                    onGenerate={() => handleGenerateReport('Ficha Resumen del Solicitante')}
                />
                <ReportCard
                    title="Informe de Casos en Particular"
                    description="Genera el detalle de un caso, usando solo el código."
                    icon={<DocumentChartBarIcon className="w-7 h-7" />}
                    variant="danger"
                    onGenerate={() => handleGenerateReport('Informe de Casos en Particular')}
                />
            </div>

            {/* Filter Bar with View Switcher */}
            <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Dynamic Content Area */}
            <div className="transition-all duration-300 mt-6">
                {viewMode === 'charts' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DistributionChart data={currentDistributionData} />
                        <TopCasesChart data={currentTopCasesData} />
                    </div>
                ) : (
                    <KPIDashboard />
                )}
            </div>
        </div>
    );
}
