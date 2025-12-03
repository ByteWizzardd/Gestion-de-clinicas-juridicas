'use client';

import { useState } from 'react';
import { FileBarChart, Clock, User, Briefcase } from 'lucide-react';
import ReportCard from '@/components/cards/ReportCard';
import FilterBar, { ReportFilters } from '@/components/reports/FilterBar';
import { ViewMode } from '@/components/ui/navigation/ViewSwitcher';
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
                <p className="mb-6 ml-3 text-base">Presentación de las métricas clave a través de gráficas y cuadros.</p>
            </div>

            {/* Report Generation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <ReportCard
                    title="Informe Global de Actividad"
                    icon={<FileBarChart className="w-full h-full" strokeWidth={1.5} />}
                    onGenerate={() => handleGenerateReport('Informe Global de Actividad')}
                    buttonColor="red"
                />
                <ReportCard
                    title="Reporte de Estatus de Casos"
                    icon={<Clock className="w-full h-full" strokeWidth={1.5} />}
                    onGenerate={() => handleGenerateReport('Reporte de Estatus de Casos')}
                    buttonColor="orange"
                />
                <ReportCard
                    title="Ficha Resumen del Solicitante"
                    icon={<User className="w-full h-full" strokeWidth={1.5} />}
                    onGenerate={() => handleGenerateReport('Ficha Resumen del Solicitante')}
                    buttonColor="red"
                />
                <ReportCard
                    title="Informe de Casos en Particular"
                    icon={<Briefcase className="w-full h-full" strokeWidth={1.5} />}
                    onGenerate={() => handleGenerateReport('Informe de Casos en Particular')}
                    buttonColor="orange"
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
