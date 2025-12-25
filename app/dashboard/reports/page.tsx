'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);
        
        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };
        
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Get filtered data based on selected nucleo
    const currentDistributionData = nucleoDistributionData[filters.nucleo] || distributionData;
    const currentTopCasesData = nucleoTopCasesData[filters.nucleo] || topCasesData;

    const handleGenerateReport = async (reportType: string) => {
        if (reportType === 'Tipos de Casos') {
            try {
                // Obtener datos agrupados
                const response = await fetch('/api/reports/tipos-casos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fechaInicio: filters.dateRange !== 'all' ? getDateFromRange(filters.dateRange) : undefined,
                        fechaFin: filters.dateRange !== 'all' ? new Date().toISOString().split('T')[0] : undefined,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Error al obtener datos');
                }

                const result = await response.json();
                
                if (result.success && result.data) {
                    // Importar y usar la función de generación de PDF con React PDF
                    const { generateTiposCasosPDFReact } = await import('@/lib/utils/pdf-generator-react');
                    await generateTiposCasosPDFReact(
                        result.data,
                        filters.dateRange !== 'all' ? getDateFromRange(filters.dateRange) : undefined,
                        filters.dateRange !== 'all' ? new Date().toISOString().split('T')[0] : undefined
                    );
                } else {
                    alert('Error al generar el reporte: ' + (result.error || 'Error desconocido'));
                }
            } catch (error) {
                console.error('Error al generar reporte:', error);
                alert('Error al generar el reporte. Por favor, intente nuevamente.');
            }
        } else {
            alert(`Generando ${reportType}...`);
        }
    };

    const getDateFromRange = (range: string): string => {
        const today = new Date();
        const date = new Date();
        
        switch (range) {
            case 'last-week':
                date.setDate(today.getDate() - 7);
                break;
            case 'last-month':
                date.setMonth(today.getMonth() - 1);
                break;
            case 'last-3-months':
                date.setMonth(today.getMonth() - 3);
                break;
            case 'last-year':
                date.setFullYear(today.getFullYear() - 1);
                break;
            default:
                return today.toISOString().split('T')[0];
        }
        
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div 
                className="mb-4"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
            >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl m-3 font-semibold font-primary">Reportes</h1>
                <p className="mb-6 ml-3 text-base">Presentación de las métricas clave a través de gráficas y cuadros.</p>
            </motion.div>

            {/* Report Generation Cards */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
            >
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
                    title="Tipos de Casos"
                    icon={<Briefcase className="w-full h-full" strokeWidth={1.5} />}
                    onGenerate={() => handleGenerateReport('Tipos de Casos')}
                    buttonColor="orange"
                />
            </motion.div>

            {/* Filter Bar with View Switcher */}
            <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.15, ease: "easeOut" }}
            >
                <FilterBar
                    filters={filters}
                    onFilterChange={setFilters}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            </motion.div>

            {/* Dynamic Content Area */}
            <motion.div 
                className="transition-all duration-300 mt-6"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
            >
                {viewMode === 'charts' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DistributionChart data={currentDistributionData} />
                        <TopCasesChart data={currentTopCasesData} />
                    </div>
                ) : (
                    <KPIDashboard />
                )}
            </motion.div>
        </div>
    );
}
