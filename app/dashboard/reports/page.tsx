'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileBarChart, Clock, User, Briefcase } from 'lucide-react';
import ReportCard from '@/components/cards/ReportCard';
import FilterBar, { ReportFilters } from '@/components/reports/FilterBar';
import { ViewMode } from '@/components/ui/navigation/ViewSwitcher';
import DistributionChart from '@/components/reports/charts/DistributionChart';
import TopCasesChart from '@/components/reports/charts/TopCasesChart';
import StatusDistributionChart from '@/components/reports/charts/StatusDistributionChart';
import CaseLoadTrendChart from '@/components/reports/charts/CaseLoadTrendChart';
import KPIDashboard from '@/components/reports/KPIDashboard';
import type { DistributionData, TopCasesData, KPIData, StatusDistributionData, CaseLoadTrendData } from '@/lib/utils/reports-data-mapper';

export default function ReportsPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('charts');
    const [filters, setFilters] = useState<ReportFilters>({
        dateRange: 'last-month',
        nucleo: 'all',
        term: 'all'
    });
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Data states
    const [distributionData, setDistributionData] = useState<DistributionData[]>([]);
    const [topCasesData, setTopCasesData] = useState<TopCasesData[]>([]);
    const [statusDistributionData, setStatusDistributionData] = useState<StatusDistributionData[]>([]);
    const [caseLoadTrendData, setCaseLoadTrendData] = useState<CaseLoadTrendData[]>([]);
    const [kpiData, setKPIData] = useState<KPIData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Fetch data when filters change
    useEffect(() => {
        const fetchReportsData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Build query parameters
                const params = new URLSearchParams();

                if (filters.dateRange !== 'all') {
                    const fechaInicio = getDateFromRange(filters.dateRange);
                    const fechaFin = new Date().toISOString().split('T')[0];
                    params.append('fechaInicio', fechaInicio);
                    params.append('fechaFin', fechaFin);
                }

                if (filters.nucleo !== 'all') {
                    params.append('idNucleo', filters.nucleo);
                }

                if (filters.term !== 'all') {
                    params.append('term', filters.term);
                }

                const queryString = params.toString();

                // Fetch all data in parallel
                const [distributionRes, topCasesRes, statusDistRes, trendRes, kpiRes] = await Promise.all([
                    fetch(`/api/reports/distribution?${queryString}`),
                    fetch(`/api/reports/top-cases?${queryString}`),
                    fetch(`/api/reports/status-distribution?${queryString}`),
                    fetch(`/api/reports/case-load-trend?${queryString}`),
                    fetch(`/api/reports/kpi?${queryString}`)
                ]);

                const [distributionResult, topCasesResult, statusDistResult, trendResult, kpiResult] = await Promise.all([
                    distributionRes.json(),
                    topCasesRes.json(),
                    statusDistRes.json(),
                    trendRes.json(),
                    kpiRes.json()
                ]);

                if (distributionResult.success) {
                    setDistributionData(distributionResult.data);
                }

                if (topCasesResult.success) {
                    setTopCasesData(topCasesResult.data);
                }

                if (statusDistResult.success) {
                    setStatusDistributionData(statusDistResult.data);
                }

                if (trendResult.success) {
                    setCaseLoadTrendData(trendResult.data);
                }

                if (kpiResult.success) {
                    setKPIData(kpiResult.data);
                }

            } catch (err) {
                console.error('Error fetching reports data:', err);
                setError('Error al cargar datos de reportes');
            } finally {
                setLoading(false);
            }
        };

        fetchReportsData();
    }, [filters]);

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

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Dynamic Content Area */}
            <motion.div
                className="transition-all duration-300 mt-6"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
            >
                {viewMode === 'charts' ? (
                    loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-96 animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                                    <div className="h-64 bg-gray-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DistributionChart data={distributionData} />
                            <TopCasesChart data={topCasesData} />
                            <StatusDistributionChart data={statusDistributionData} />
                            <CaseLoadTrendChart data={caseLoadTrendData} />
                        </div>
                    )
                ) : (
                    <KPIDashboard data={kpiData || undefined} loading={loading} />
                )}
            </motion.div>
        </div>
    );
}
