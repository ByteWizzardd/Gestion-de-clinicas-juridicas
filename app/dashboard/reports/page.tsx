'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileBarChart, Clock, User, Briefcase, X, Calendar } from 'lucide-react';
import ReportCard from '@/components/cards/ReportCard';
import FilterBar, { ReportFilters } from '@/components/reports/FilterBar';
import { ViewMode } from '@/components/ui/navigation/ViewSwitcher';
import DistributionChart from '@/components/reports/charts/DistributionChart';
import TopCasesChart from '@/components/reports/charts/TopCasesChart';
import StatusDistributionChart from '@/components/reports/charts/StatusDistributionChart';
import CaseLoadTrendChart from '@/components/reports/charts/CaseLoadTrendChart';
import KPIDashboard from '@/components/reports/KPIDashboard';
import Modal from '@/components/ui/feedback/Modal';
import DatePicker from '@/components/forms/DatePicker';
import Button from '@/components/ui/Button';
import type { DistributionData, TopCasesData, KPIData, StatusDistributionData, CaseLoadTrendData } from '@/lib/utils/reports-data-mapper';

export default function ReportsPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('charts');
    const [filters, setFilters] = useState<ReportFilters>({
        dateRange: 'all',
        nucleo: 'all',
        term: 'all'
    });
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    
    // Estados para el modal de fechas del reporte "Tipos de Caso" y "Estatus de Casos"
    const [showDateModal, setShowDateModal] = useState(false);
    const [fechaInicioReporte, setFechaInicioReporte] = useState('');
    const [fechaFinReporte, setFechaFinReporte] = useState('');
    const [dateError, setDateError] = useState<string | null>(null);
    const [tipoReporteActual, setTipoReporteActual] = useState<string>('');

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
                // Import server actions
                const {
                    getDistributionByNucleo,
                    getTopCases,
                    getDistributionByStatus,
                    getCaseLoadTrend,
                    getKPIStats
                } = await import('@/app/actions/reports');

                // Build parameters
                let fechaInicio: string | undefined;
                let fechaFin: string | undefined;
                let idNucleo: number | undefined;
                let term: string | undefined;

                if (filters.dateRange !== 'all') {
                    fechaInicio = getDateFromRange(filters.dateRange);
                    fechaFin = new Date().toISOString().split('T')[0];
                }

                if (filters.nucleo !== 'all') {
                    idNucleo = parseInt(filters.nucleo);
                }

                if (filters.term !== 'all') {
                    term = filters.term;
                }

                // Fetch all data in parallel using server actions
                const [distributionResult, topCasesResult, statusDistResult, trendResult, kpiResult] = await Promise.all([
                    getDistributionByNucleo(fechaInicio, fechaFin, idNucleo, term),
                    getTopCases(fechaInicio, fechaFin, idNucleo, term),
                    getDistributionByStatus(fechaInicio, fechaFin, idNucleo, term),
                    getCaseLoadTrend(fechaInicio, fechaFin, idNucleo, term),
                    getKPIStats(fechaInicio, fechaFin, idNucleo, term)
                ]);

                if (distributionResult.success && distributionResult.data) {
                    setDistributionData(distributionResult.data);
                }

                if (topCasesResult.success && topCasesResult.data) {
                    setTopCasesData(topCasesResult.data);
                }

                if (statusDistResult.success && statusDistResult.data) {
                    setStatusDistributionData(statusDistResult.data);
                }

                if (trendResult.success && trendResult.data) {
                    setCaseLoadTrendData(trendResult.data);
                }

                if (kpiResult.success && kpiResult.data) {
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
        if (reportType === 'Tipos de Caso' || reportType === 'Reporte de Estatus de Casos') {
            // Guardar el tipo de reporte actual
            setTipoReporteActual(reportType);
            // Mostrar modal para seleccionar rango de fechas
            setShowDateModal(true);
            // Sin fechas por defecto - si no se seleccionan, el reporte es histórico
            setFechaInicioReporte('');
            setFechaFinReporte('');
            setDateError(null);
        } else {
            alert(`Generando ${reportType}...`);
        }
    };

    const handleGenerateTiposCasosReport = async () => {
        // Si se proporciona una fecha, ambas deben estar presentes
        if ((fechaInicioReporte && !fechaFinReporte) || (!fechaInicioReporte && fechaFinReporte)) {
            setDateError('Si selecciona una fecha, debe seleccionar ambas');
            return;
        }

        // Validar que fecha inicio sea menor o igual a fecha fin (solo si hay fechas)
        if (fechaInicioReporte && fechaFinReporte && new Date(fechaInicioReporte) > new Date(fechaFinReporte)) {
            setDateError('La fecha de fin debe ser mayor o igual a la fecha de inicio');
            return;
        }

        setDateError(null);
        setShowDateModal(false);

        try {
            // Convertir fechas vacías a undefined para reporte histórico
            const fechaInicio = fechaInicioReporte || undefined;
            const fechaFin = fechaFinReporte || undefined;

            if (tipoReporteActual === 'Reporte de Estatus de Casos') {
                // Generar reporte de estatus
                const { getCasosGroupedByEstatus } = await import('@/app/actions/reports');
                const result = await getCasosGroupedByEstatus(
                    fechaInicio,
                    fechaFin
                );

                if (result.success && result.data) {
                    // Verificar si hay datos para el reporte
                    if (result.data.length === 0 || result.data.every(item => item.cantidad_casos === 0)) {
                        alert('No hay casos registrados. Por favor, registre casos antes de generar el reporte.');
                        return;
                    }

                    // Importar y usar la función de generación de PDF
                    const { generateEstatusCasosPDFReact } = await import('@/lib/utils/pdf-generator-react');
                    await generateEstatusCasosPDFReact(
                        result.data,
                        fechaInicio,
                        fechaFin
                    );
                } else {
                    alert('Error al generar el reporte: ' + (result.error || 'Error desconocido'));
                }
            } else {
                // Generar reporte de tipos de caso (comportamiento original)
                const { getCasosGroupedByAmbitoLegal } = await import('@/app/actions/reports');
                const result = await getCasosGroupedByAmbitoLegal(
                    fechaInicio,
                    fechaFin
                );

                if (result.success && result.data) {
                    // Verificar si hay datos para el reporte
                    if (result.data.length === 0 || result.data.every(item => item.cantidad_casos === 0)) {
                        alert('No hay casos registrados. Por favor, registre casos antes de generar el reporte.');
                        return;
                    }

                    // Importar y usar la función de generación de PDF con React PDF
                    const { generateTiposCasosPDFReact } = await import('@/lib/utils/pdf-generator-react');
                    await generateTiposCasosPDFReact(
                        result.data,
                        fechaInicio,
                        fechaFin
                    );
                } else {
                    alert('Error al generar el reporte: ' + (result.error || 'Error desconocido'));
                }
            }
        } catch (error) {
            console.error('Error al generar reporte:', error);
            alert('Error al generar el reporte. Por favor, intente nuevamente.');
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
        <div className="pt-2 px-6 pb-6 space-y-6 overflow-x-hidden max-w-full">
            {/* Header */}
            <motion.div
                className="mb-4 md:mb-6"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
            >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl m-3 font-semibold font-primary">Reportes</h1>
                <p className="mb-6 ml-3 text-base">Presentación de las métricas clave a través de gráficas y cuadros.</p>
            </motion.div>

            {/* Report Generation Cards */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full min-w-0"
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
                    title="Tipos de Caso"
                    icon={<Briefcase className="w-full h-full" strokeWidth={1.5} />}
                    onGenerate={() => handleGenerateReport('Tipos de Caso')}
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
                            <div className="w-full min-w-0">
                                <DistributionChart data={distributionData} />
                            </div>
                            <div className="w-full min-w-0">
                                <TopCasesChart data={topCasesData} />
                            </div>
                            <div className="w-full min-w-0">
                                <StatusDistributionChart data={statusDistributionData} />
                            </div>
                            <div className="w-full min-w-0">
                                <CaseLoadTrendChart data={caseLoadTrendData} />
                            </div>
                        </div>
                    )
                ) : (
                    <KPIDashboard data={kpiData || undefined} loading={loading} />
                )}
            </motion.div>

            {/* Modal para seleccionar rango de fechas del reporte "Tipos de Caso" */}
            <Modal
                isOpen={showDateModal}
                onClose={() => {
                    setShowDateModal(false);
                    setDateError(null);
                }}
                size="md"
                showCloseButton={false}
            >
                <div className="p-6 relative">
                    {/* Botón de cerrar */}
                    <button
                        onClick={() => {
                            setShowDateModal(false);
                            setDateError(null);
                        }}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
                        aria-label="Cerrar modal"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    {/* Título */}
                    <h2 className="text-xl font-normal text-foreground mb-4">
                        {tipoReporteActual === 'Reporte de Estatus de Casos' 
                            ? 'Rango de Fechas - Estatus de Casos'
                            : 'Rango de Fechas - Tipos de Caso'}
                    </h2>

                    {/* Grid de formulario */}
                    <div className="grid grid-cols-1 gap-4 mb-4">
                        {/* Fecha de Inicio */}
                        <div>
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-normal text-foreground mb-1">
                                    Fecha de Inicio
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
                                    <DatePicker
                                        value={fechaInicioReporte}
                                        onChange={(value) => {
                                            setFechaInicioReporte(value);
                                            setDateError(null);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fecha de Fin */}
                        <div>
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-normal text-foreground mb-1">
                                    Fecha de Fin
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
                                    <DatePicker
                                        value={fechaFinReporte}
                                        onChange={(value) => {
                                            setFechaFinReporte(value);
                                            setDateError(null);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mensaje informativo sobre histórico */}
                    <p className="text-sm text-gray-500 mb-4">
                        Si no selecciona fechas, se generará un reporte histórico con todos los casos.
                    </p>

                    {/* Mensaje de error */}
                    {dateError && (
                        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                            {dateError}
                        </div>
                    )}

                    {/* Footer con botón */}
                    <div className="flex flex-col border-t border-gray-200 pt-4">
                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => {
                                    setShowDateModal(false);
                                    setDateError(null);
                                }}
                                variant="outline"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleGenerateTiposCasosReport}
                                variant="primary"
                            >
                                Generar Reporte
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
