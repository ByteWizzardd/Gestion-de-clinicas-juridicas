'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileBarChart, Clock, User, Briefcase, X, Calendar, Home, History, Users, Scale } from 'lucide-react';
import ReportCard from '@/components/cards/ReportCard';
import FilterBar, { ReportFilters } from '@/components/reports/FilterBar';

import DistributionChart from '@/components/reports/charts/DistributionChart';
import TopCasesChart from '@/components/reports/charts/TopCasesChart';
import StatusDistributionChart from '@/components/reports/charts/StatusDistributionChart';
import TramiteDistributionChart from '@/components/reports/charts/TramiteDistributionChart'; // New Import
import ReportPreview from '@/components/reports/ReportPreview';

import Select from '@/components/forms/Select';
import Modal from '@/components/ui/feedback/Modal';
import DatePicker from '@/components/forms/DatePicker';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/feedback/Spinner';
import { useCallback } from 'react';
import { saveAs } from 'file-saver';
import { logger } from '@/lib/utils/logger';
import type { DistributionData, TopCasesData, StatusDistributionData, CaseLoadTrendData } from '@/lib/utils/reports-data-mapper';
import type { CasoHistorialData, SolicitanteFichaData } from '@/lib/types/report-types';
import { useToast } from '@/components/ui/feedback/ToastProvider';

import {
    getDistributionByNucleo,
    getTopCases,
    getDistributionByStatus,
    getDistributionByTramite,
    registrarAuditoriaReporteAction
} from '@/app/actions/reports';
import { TIPOS_REPORTE, DESCRIPCIONES_REPORTE } from '@/lib/constants/reports';

interface ResumenSectionsData {
    casosPorMateria: boolean;
    solicitantesPorGenero: boolean;
    solicitantesPorEstado: boolean;
    solicitantesPorParroquia: boolean;
    estudiantesPorMateria: boolean;
    profesoresPorMateria: boolean;
    tiposDeCaso: boolean;
    beneficiariosPorTipo: boolean;
    beneficiariosPorParentesco: boolean;
}

const RESUMEN_SECCIONES_LABELS: Record<keyof ResumenSectionsData, string> = {
    tiposDeCaso: "Tipos de Caso",
    casosPorMateria: "Casos por Materia",
    solicitantesPorGenero: "Solicitantes por Género",
    solicitantesPorEstado: "Solicitantes por Estado",
    solicitantesPorParroquia: "Solicitantes por Parroquia",
    estudiantesPorMateria: "Estudiantes por Materia",
    profesoresPorMateria: "Profesores por Materia",
    beneficiariosPorTipo: "Beneficiarios Directos/Indirectos",
    beneficiariosPorParentesco: "Beneficiarios por Parentesco"
};

export default function ReportsPage() {

    const [filters, setFilters] = useState<ReportFilters>({
        dateRange: 'all',
        nucleo: 'all',
        term: 'all'
    });
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const { toast } = useToast();

    // Estados para el modal de fechas del reporte "Tipos de Caso" y "Estatus de Casos"
    const [showDateModal, setShowDateModal] = useState(false);
    const [fechaInicioReporte, setFechaInicioReporte] = useState('');
    const [fechaFinReporte, setFechaFinReporte] = useState('');
    const [dateError, setDateError] = useState<string | null>(null);
    const [tipoReporteActual, setTipoReporteActual] = useState<string>('');
    const [formatoReporte, setFormatoReporte] = useState<'pdf' | 'word'>('pdf');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [termOptions, setTermOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedTermReporte, setSelectedTermReporte] = useState('all');

    // Estado para secciones del reporte de resumen
    const [selectedResumenSections, setSelectedResumenSections] = useState<ResumenSectionsData>({
        casosPorMateria: true,
        solicitantesPorGenero: true,
        solicitantesPorEstado: true,
        solicitantesPorParroquia: true,
        estudiantesPorMateria: true,
        profesoresPorMateria: true,
        tiposDeCaso: true,
        beneficiariosPorTipo: true,
        beneficiariosPorParentesco: true
    });

    // Interface y Estado para secciones del reporte socioeconómico
    interface SocioeconomicoSectionsData {
        genero: boolean;
        edad: boolean;
        estadoCivil: boolean;
        nivelEducativo: boolean;
        condicionTrabajo: boolean;
        condicionActividad: boolean;
        ingresos: boolean;
        tamanoHogar: boolean;
        ninosHogar: boolean;
        trabajadoresHogar: boolean;
        dependientes: boolean;
        habitaciones: boolean;
        banos: boolean;
        tipoVivienda: boolean; // Agrupa características de vivienda tipo
        aguaPotable: boolean;
        aseoUrbano: boolean;
        aguasNegras: boolean;
        artefactosHogar: boolean;
        materialParedes: boolean;
        materialPiso: boolean;
        materialTecho: boolean;
    }

    const [selectedSocioeconomicoSections, setSelectedSocioeconomicoSections] = useState<SocioeconomicoSectionsData>({
        genero: true,
        edad: true,
        estadoCivil: true,
        nivelEducativo: true,
        condicionTrabajo: true,
        condicionActividad: true,
        ingresos: true,
        tamanoHogar: true,
        ninosHogar: true,
        trabajadoresHogar: true,
        dependientes: true,
        habitaciones: true,
        banos: true,
        tipoVivienda: true,
        aguaPotable: true,
        aseoUrbano: true,
        aguasNegras: true,
        artefactosHogar: true,
        materialParedes: true,
        materialPiso: true,
        materialTecho: true
    });

    const toggleResumenSection = (key: keyof ResumenSectionsData) => {
        setSelectedResumenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSocioeconomicoSection = (key: keyof SocioeconomicoSectionsData) => {
        setSelectedSocioeconomicoSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Tab state for modal
    const [activeTab, setActiveTab] = useState<'filtros' | 'secciones'>('filtros');

    // Data states
    const [distributionData, setDistributionData] = useState<DistributionData[]>([]);
    const [topCasesData, setTopCasesData] = useState<TopCasesData[]>([]);
    const [statusDistributionData, setStatusDistributionData] = useState<StatusDistributionData[]>([]);
    const [tramiteDistributionData, setTramiteDistributionData] = useState<any[]>([]); // New State

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para historial de solicitante
    const [solicitantes, setSolicitantes] = useState<any[]>([]);
    const [filteredSolicitantes, setFilteredSolicitantes] = useState<any[]>([]);
    const [selectedSolicitante, setSelectedSolicitante] = useState<any | null>(null);
    const [solicitanteSearch, setSolicitanteSearch] = useState('');
    const [isLoadingSolicitantes, setIsLoadingSolicitantes] = useState(false);
    const [showSolicitanteDropdown, setShowSolicitanteDropdown] = useState(false);

    // Ref para cancelar operaciones en curso al cerrar el modal
    const reportAbortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

        // Cargar opciones de periodos
        const loadTermOptions = async () => {
            try {
                const { getFilterOptions } = await import('@/app/actions/reports');
                const result = await getFilterOptions();
                if (result.success && result.data) {
                    setTermOptions(result.data.termOptions);
                    // Also load solicitantes proactively if needed, or lazy load on modal open
                }
            } catch (err) {
                logger.error('Error loading term options:', err);
            }
        };
        loadTermOptions();

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Cargar solicitantes cuando se abre el modal de este tipo
    useEffect(() => {
        if (showDateModal && (tipoReporteActual === 'Historial de Casos del Solicitante' || tipoReporteActual === 'Ficha Resumen del Solicitante')) {
            const loadSolicitantes = async () => {
                setIsLoadingSolicitantes(true);
                try {
                    // Usamos import dinámico para evitar cargar todo de una vez
                    const { getSolicitantesAction } = await import('@/app/actions/solicitantes');
                    const result = await getSolicitantesAction();
                    if (result.success && result.data) {
                        setSolicitantes(result.data);
                        setFilteredSolicitantes(result.data);
                    }
                } catch (error) {
                    logger.error('Error loading solicitantes:', error);
                } finally {
                    setIsLoadingSolicitantes(false);
                }
            };
            loadSolicitantes();
        }
    }, [showDateModal, tipoReporteActual]);

    // Filtrar solicitantes
    useEffect(() => {
        if (!solicitanteSearch) {
            setFilteredSolicitantes(solicitantes);
        } else {
            const lowerSearch = solicitanteSearch.toLowerCase();
            const filtered = solicitantes.filter(s =>
                (s.nombre_completo?.toLowerCase() || '').includes(lowerSearch) ||
                (s.cedula?.toLowerCase() || '').includes(lowerSearch)
            );
            setFilteredSolicitantes(filtered);
        }
    }, [solicitanteSearch, solicitantes]);


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
                    getDistributionByTramite
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
                const [distributionResult, topCasesResult, statusDistResult, tramitetResult] = await Promise.all([
                    getDistributionByNucleo(fechaInicio, fechaFin, idNucleo, term),
                    getTopCases(fechaInicio, fechaFin, idNucleo, term),
                    getDistributionByStatus(fechaInicio, fechaFin, idNucleo, term),
                    getDistributionByTramite(fechaInicio, fechaFin, idNucleo, term)
                ]);

                if (distributionResult.success && distributionResult.data) {
                    setDistributionData(distributionResult.data as DistributionData[]);
                }

                if (topCasesResult.success && topCasesResult.data) {
                    setTopCasesData(topCasesResult.data as TopCasesData[]);
                }

                if (statusDistResult.success && statusDistResult.data) {
                    setStatusDistributionData(statusDistResult.data as StatusDistributionData[]);
                }

                if (tramitetResult.success && tramitetResult.data) {
                    setTramiteDistributionData(tramitetResult.data);
                }

            } catch (err) {
                logger.error('Error fetching reports data:', err);
                setError('Error al cargar datos de reportes');
            } finally {
                setLoading(false);
            }
        };

        fetchReportsData();
    }, [filters]);

    const handleGenerateReport = async (reportType: string) => {
        if (reportType === 'Tipos de Caso' ||
            reportType === 'Estatus de Casos' ||
            reportType === 'Resumen de Casos' ||
            reportType === 'Reporte Socioeconómico' ||
            reportType === 'Historial de Casos del Solicitante' ||
            reportType === 'Ficha Resumen del Solicitante') { // Added new type

            // Guardar el tipo de reporte actual
            setTipoReporteActual(reportType);
            // Mostrar modal para seleccionar rango de fechas
            setShowDateModal(true);

            // Reset states
            setActiveTab('filtros');
            setFechaInicioReporte('');
            setFechaFinReporte('');
            setSelectedTermReporte('all');
            setFormatoReporte('pdf');
            setDateError(null);

            // Reset solicitante selection
            setSelectedSolicitante(null);
            setSolicitanteSearch('');
            setShowSolicitanteDropdown(false);
        } else {
            alert(`Generando ${reportType}...`);
        }
    };

    // Determine if current report type supports preview (NOW ALL SUPPORT IT)
    const supportsPreview = tipoReporteActual !== '';

    // Generate a PDF blob for preview (used by the ReportPreview component)
    // Accepts an AbortSignal from ReportPreview so it can be cancelled
    const generatePreviewBlob = useCallback(async (signal: AbortSignal): Promise<Blob | null> => {
        const fechaInicio = fechaInicioReporte || undefined;
        const fechaFin = fechaFinReporte || undefined;
        const term = selectedTermReporte !== 'all' ? selectedTermReporte : undefined;

        try {
            // Validar que si se selecciona una fecha, se deben seleccionar ambas
            if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
                return new Blob([], { type: 'application/invalid-dates' });
            }


            if (tipoReporteActual === 'Resumen de Casos') {

                // Verificar si hay al menos una sección seleccionada
                const hasSelectedSections = Object.values(selectedResumenSections as unknown as Record<string, boolean>).some(Boolean);
                if (!hasSelectedSections) {
                    return new Blob([], { type: 'application/no-sections' });
                }

                const { getInformeResumenData } = await import('@/app/actions/reports');
                const result = await getInformeResumenData(fechaInicio, fechaFin, term);
                if (signal.aborted) return null;
                if (result.success && result.data) {
                    const { generateInformeResumenPDFBlob } = await import('@/lib/utils/pdf-preview-generators');
                    if (signal.aborted) return null;
                    return await generateInformeResumenPDFBlob(
                        result.data,
                        fechaInicio,
                        fechaFin,
                        term,
                        formatoReporte === 'word',
                        selectedResumenSections as unknown as Record<string, boolean>
                    );
                }
            } else if (tipoReporteActual === 'Estatus de Casos') {
                const { getCasosGroupedByEstatus } = await import('@/app/actions/reports');
                const result = await getCasosGroupedByEstatus(fechaInicio, fechaFin, term);
                if (signal.aborted) return null;
                if (result.success && result.data && result.data.length > 0) {
                    const { generateEstatusCasosPDFBlob } = await import('@/lib/utils/pdf-preview-generators');
                    if (signal.aborted) return null;
                    return await generateEstatusCasosPDFBlob(result.data, fechaInicio, fechaFin, term, formatoReporte === 'word');
                }
            } else if (tipoReporteActual === 'Reporte Socioeconómico') {
                // Verificar si hay al menos una sección seleccionada
                const hasSelectedSections = Object.values(selectedSocioeconomicoSections as unknown as Record<string, boolean>).some(Boolean);
                if (!hasSelectedSections) {
                    return new Blob([], { type: 'application/no-sections' });
                }

                const { getInformeSocioeconomicoData } = await import('@/app/actions/reports');
                const result = await getInformeSocioeconomicoData(fechaInicio, fechaFin, term);
                if (signal.aborted) return null;
                if (result.success && result.data) {
                    const { generateSocioeconomicoPDFBlob } = await import('@/lib/utils/pdf-preview-generators');
                    if (signal.aborted) return null;
                    return await generateSocioeconomicoPDFBlob(
                        result.data,
                        fechaInicio,
                        fechaFin,
                        term,
                        formatoReporte === 'word',
                        selectedSocioeconomicoSections as unknown as Record<string, boolean>
                    );
                }
            } else if (tipoReporteActual === 'Historial de Casos del Solicitante') {
                if (!selectedSolicitante) return null;
                const { getHistorialCasosBySolicitante } = await import('@/app/actions/reports');
                const result = await getHistorialCasosBySolicitante(selectedSolicitante.cedula, fechaInicio, fechaFin, term);
                if (signal.aborted) return null;

                if (result.success && result.data && result.data.length > 0) {
                    const { generateCasoHistorialPDFBlob } = await import('@/lib/utils/pdf-preview-generators');
                    if (signal.aborted) return null;
                    // Mostrar vista previa de TODOS los casos encontrados (MultiPage PDF)
                    return await generateCasoHistorialPDFBlob(result.data as any[]);
                }
                // Sin casos en el semestre/periodo seleccionado -> preview vacío
                return null;
            } else if (tipoReporteActual === 'Ficha Resumen del Solicitante') {
                if (!selectedSolicitante) return null;
                const { getSolicitanteFichaData } = await import('@/app/actions/reports');
                const result = await getSolicitanteFichaData(selectedSolicitante.cedula);
                if (signal.aborted) return null;

                if (result.success && result.data) {
                    const { generateSolicitanteFichaPDFBlob } = await import('@/lib/utils/pdf-preview-generators');
                    if (signal.aborted) return null;
                    return await generateSolicitanteFichaPDFBlob(result.data as any);
                }

            } else {
                // Default: Tipos de Caso
                const { getCasosGroupedByAmbitoLegal } = await import('@/app/actions/reports');
                const result = await getCasosGroupedByAmbitoLegal(fechaInicio, fechaFin, term);
                if (signal.aborted) return null;
                if (result.success && result.data && result.data.length > 0) {
                    const { generateTiposCasosPDFBlob } = await import('@/lib/utils/pdf-preview-generators');
                    if (signal.aborted) return null;
                    return await generateTiposCasosPDFBlob(result.data, fechaInicio, fechaFin, term, formatoReporte === 'word');
                }
            }
            return null;
        } catch (error) {
            if (signal.aborted) return null;
            logger.error('Error generating preview blob:', error);
            return null;
        }
    }, [tipoReporteActual, fechaInicioReporte, fechaFinReporte, selectedTermReporte, selectedSolicitante, formatoReporte, selectedResumenSections, selectedSocioeconomicoSections]);

    // Helper: abort any in-flight report generation
    const abortReportGeneration = useCallback(() => {
        if (reportAbortRef.current) {
            reportAbortRef.current.abort();
            reportAbortRef.current = null;
        }
    }, []);

    // Helper: close modal and abort everything
    const handleCloseModal = useCallback(() => {
        setShowDateModal(false);
        setDateError(null);
        abortReportGeneration();
    }, [abortReportGeneration]);

    // Register audit when preview is generated
    const handlePreviewGenerated = useCallback(async () => {
        // Map tipoReporteActual label to constant
        const tipoReporteMap: Record<string, string> = {
            'Tipos de Caso': TIPOS_REPORTE.DISTRIBUCION_TRAMITE,
            'Estatus de Casos': TIPOS_REPORTE.DISTRIBUCION_ESTATUS,
            'Resumen de Casos': TIPOS_REPORTE.INFORME_RESUMEN,
            'Reporte Socioeconómico': TIPOS_REPORTE.INFORME_SOCIOECONOMICO,
            'Historial de Casos del Solicitante': TIPOS_REPORTE.HISTORIAL_SOLICITANTE,
            'Ficha Resumen del Solicitante': TIPOS_REPORTE.EXPEDIENTE_SOLICITANTE,
        };

        const tipoReporte = tipoReporteMap[tipoReporteActual];
        if (!tipoReporte) return;

        try {
            await registrarAuditoriaReporteAction({
                tipoReporte,
                filtrosAplicados: {
                    fechaInicio: fechaInicioReporte || undefined,
                    fechaFin: fechaFinReporte || undefined,
                    semestre: selectedTermReporte !== 'all' ? selectedTermReporte : undefined,
                    ...(selectedSolicitante ? { cedulaSolicitante: selectedSolicitante.cedula } : {}),
                },
                formato: 'PDF',
                cedulaSolicitante: selectedSolicitante?.cedula,
                operacion: 'vista_previa',
            });
        } catch (err) {
            // No bloquear la vista previa por un error de auditoría
            logger.error('Error registrando auditoría de vista previa:', err);
        }
    }, [tipoReporteActual, fechaInicioReporte, fechaFinReporte, selectedTermReporte, selectedSolicitante]);

    const handleGenerateTiposCasosReport = async () => {
        // Validacion especifica para historial solicitante y ficha resumen
        if (tipoReporteActual === 'Historial de Casos del Solicitante' || tipoReporteActual === 'Ficha Resumen del Solicitante') {
            if (!selectedSolicitante) {
                setDateError('Debe seleccionar un solicitante');
                return;
            }
        }

        // Validar que se haya seleccionado algo si no es histórico (para los otros reportes)
        // Para historial de solicitante, fechas vacías significan "todos los casos históricos"
        if (tipoReporteActual !== 'Historial de Casos del Solicitante' && tipoReporteActual !== 'Ficha Resumen del Solicitante') {
            if (!fechaInicioReporte && !fechaFinReporte && selectedTermReporte === 'all') {
                // Permitir histórico
            } else if (selectedTermReporte === 'all' && ((fechaInicioReporte && !fechaFinReporte) || (!fechaInicioReporte && fechaFinReporte))) {
                setDateError('Si selecciona una fecha, debe seleccionar ambas');
                return;
            }
        } else {
            // Para solicitante, si elige fecha, deben ser ambas
            if ((fechaInicioReporte && !fechaFinReporte) || (!fechaInicioReporte && fechaFinReporte)) {
                setDateError('Si selecciona una fecha, debe seleccionar ambas');
                return;
            }
        }

        // Validar que fecha inicio sea menor o igual a fecha fin (solo si hay fechas)
        if (fechaInicioReporte && fechaFinReporte && new Date(fechaInicioReporte) > new Date(fechaFinReporte)) {
            setDateError('La fecha de fin debe ser mayor o igual a la fecha de inicio');
            return;
        }

        // Validar que se haya seleccionado al menos una sección para el Resumen de Casos
        if (tipoReporteActual === 'Resumen de Casos') {
            const hasSelectedSections = Object.values(selectedResumenSections as unknown as Record<string, boolean>).some(Boolean);
            if (!hasSelectedSections) {
                toast.warning('Debe seleccionar al menos una sección para generar el reporte.');
                return;
            }
        }

        // Validar para el Reporte Socioeconómico
        if (tipoReporteActual === 'Reporte Socioeconómico') {
            const hasSelectedSections = Object.values(selectedSocioeconomicoSections as unknown as Record<string, boolean>).some(Boolean);
            if (!hasSelectedSections) {
                toast.warning('Debe seleccionar al menos una sección para generar el reporte.');
                return;
            }
        }

        setDateError(null);
        // NO cerrar modal inmediatamente si es historial, para feedback visual, pero mejor cerrarlo y mostrar loading
        setShowDateModal(false);
        setIsGeneratingReport(true);

        // Crear AbortController para esta generación
        abortReportGeneration();
        const controller = new AbortController();
        reportAbortRef.current = controller;

        // Aumentar el tiempo de espera inicial para que el Spinner se asiente
        setTimeout(async () => {
            try {
                // Verificar si fue cancelado antes de empezar
                if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                // Convertir fechas vacías a undefined para reporte histórico
                const fechaInicio = fechaInicioReporte || undefined;
                const fechaFin = fechaFinReporte || undefined;
                const term = selectedTermReporte !== 'all' ? selectedTermReporte : undefined;

                if (tipoReporteActual === 'Historial de Casos del Solicitante') {
                    // 1. Obtener datos
                    const { getHistorialCasosBySolicitante } = await import('@/app/actions/reports');
                    const result = await getHistorialCasosBySolicitante(
                        selectedSolicitante.cedula,
                        fechaInicio,
                        fechaFin,
                        term
                    );

                    if (controller.signal.aborted) { setIsGeneratingReport(false); return; }



                    if (result.success && result.data && result.data.length > 0) {
                        // 2. Generar ZIP
                        const { generateHistorialSolicitanteZIP } = await import('@/lib/utils/case-history-pdf-generator');
                        if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                        await generateHistorialSolicitanteZIP(result.data as CasoHistorialData[], selectedSolicitante.nombre_completo || `${selectedSolicitante.nombres} ${selectedSolicitante.apellidos}`);
                        if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                        toast.success('Historial del solicitante descargado correctamente');

                        // 3. Registrar auditoría
                        await registrarAuditoriaReporteAction({
                            tipoReporte: TIPOS_REPORTE.HISTORIAL_SOLICITANTE,
                            descripcion: DESCRIPCIONES_REPORTE[TIPOS_REPORTE.HISTORIAL_SOLICITANTE],
                            filtrosAplicados: {
                                cedulaSolicitante: selectedSolicitante.cedula,
                                nombreSolicitante: selectedSolicitante.nombre_completo,
                                fechaInicio,
                                fechaFin,
                                semestre: term,
                            },
                            formato: 'ZIP',
                            cedulaSolicitante: selectedSolicitante.cedula
                        });

                    } else {
                        if (result.success && (!result.data || result.data.length === 0)) {
                            toast.warning('No se encontraron casos para el solicitante en el rango de fechas seleccionado.');
                        } else {
                            toast.error('Error al obtener el historial: ' + (result.error || 'Error desconocido'));
                        }
                    }

                } else if (tipoReporteActual === 'Ficha Resumen del Solicitante') {
                    // 1. Obtener datos del Solicitante (Ficha)
                    const { getSolicitanteFichaData } = await import('@/app/actions/reports');
                    const fichaResult = await getSolicitanteFichaData(selectedSolicitante.cedula);
                    if (controller.signal.aborted) { setIsGeneratingReport(false); return; }

                    // 2. Obtener datos del Historial (Casos)
                    const { getHistorialCasosBySolicitante } = await import('@/app/actions/reports');
                    // Para ficha resumen, generalmente queremos TODO el historial por defecto, 
                    // pero respetamos si el usuario filtró fechas.
                    const historialResult = await getHistorialCasosBySolicitante(
                        selectedSolicitante.cedula,
                        fechaInicio,
                        fechaFin,
                        term
                    );

                    if (controller.signal.aborted) { setIsGeneratingReport(false); return; }

                    if (fichaResult.success && fichaResult.data && historialResult.success && historialResult.data) {
                        // 3. Generar ZIP Completo
                        const { generateExpedienteSolicitanteZIP } = await import('@/lib/utils/case-history-pdf-generator');
                        await generateExpedienteSolicitanteZIP(
                            fichaResult.data as SolicitanteFichaData,
                            historialResult.data as CasoHistorialData[],
                            selectedSolicitante.nombre_completo || `${selectedSolicitante.nombres} ${selectedSolicitante.apellidos}`
                        );
                        if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                        toast.success('Ficha resumen del solicitante descargada correctamente');

                        // 4. Registrar auditoría
                        await registrarAuditoriaReporteAction({
                            tipoReporte: TIPOS_REPORTE.EXPEDIENTE_SOLICITANTE,
                            descripcion: DESCRIPCIONES_REPORTE[TIPOS_REPORTE.EXPEDIENTE_SOLICITANTE],
                            filtrosAplicados: {
                                cedulaSolicitante: selectedSolicitante.cedula,
                                nombreSolicitante: selectedSolicitante.nombre_completo,
                                fechaInicio,
                                fechaFin,
                                semestre: term,
                            },
                            formato: 'ZIP',
                            cedulaSolicitante: selectedSolicitante.cedula
                        });

                    } else {
                        const errorMsg = fichaResult.error || historialResult.error || 'Error desconocido al obtener datos';
                        toast.error('Error al generar el expediente: ' + errorMsg);
                    }

                } else if (tipoReporteActual === 'Resumen de Casos') {
                    // Generar reporte resumen de casos
                    const { getInformeResumenData } = await import('@/app/actions/reports');
                    const result = await getInformeResumenData(
                        fechaInicio,
                        fechaFin,
                        term
                    );
                    if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                    if (result.success && result.data) {
                        // Verificar si hay datos principales
                        const hasData = result.data.tiposDeCaso && result.data.tiposDeCaso.length > 0 &&
                            result.data.tiposDeCaso.some(item => item.cantidad_casos > 0);

                        if (!hasData) {
                            const msg = term
                                ? `No hay casos registrados para el semestre ${term}.`
                                : 'No hay casos registrados para el periodo seleccionado.';
                            toast.warning(msg);
                            setIsGeneratingReport(false);
                            return;
                        }
                        if (formatoReporte === 'word') {
                            // Importar y usar la función de generación de DOCX
                            const { generateResumenCasosDOCX } = await import('@/lib/utils/doc-generator');
                            await generateResumenCasosDOCX(
                                result.data,
                                fechaInicio,
                                fechaFin,
                                term,
                                selectedResumenSections as unknown as Record<string, boolean>
                            );
                        } else {
                            // Importar y usar la función de generación de PDF con React PDF
                            const { generateInformeResumenPDFReact } = await import('@/lib/utils/pdf-generator-react');
                            await generateInformeResumenPDFReact(
                                result.data,
                                fechaInicio,
                                fechaFin,
                                term,
                                selectedResumenSections as unknown as Record<string, boolean>
                            );
                        }
                        if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                        toast.success('Informe resumen de casos descargado correctamente');


                        // Registrar auditoría
                        await registrarAuditoriaReporteAction({
                            tipoReporte: TIPOS_REPORTE.INFORME_RESUMEN,
                            descripcion: DESCRIPCIONES_REPORTE[TIPOS_REPORTE.INFORME_RESUMEN],
                            filtrosAplicados: {
                                fechaInicio,
                                fechaFin,
                                semestre: term
                            },
                            formato: formatoReporte === 'word' ? 'DOCX' : 'PDF'
                        });
                    } else {
                        toast.error('Error al generar el reporte: ' + (result.error || 'Error desconocido'));
                    }
                } else if (tipoReporteActual === 'Estatus de Casos') {
                    // Generar reporte de estatus de casos
                    const { getCasosGroupedByEstatus } = await import('@/app/actions/reports');
                    const result = await getCasosGroupedByEstatus(
                        fechaInicio,
                        fechaFin,
                        term
                    );
                    if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                    if (result.success && result.data) {
                        // Verificar si hay datos para el reporte
                        if (result.data.length === 0 || result.data.every(item => item.cantidad_casos === 0)) {
                            const msg = term
                                ? `No hay casos registrados para el semestre ${term}.`
                                : 'No hay casos registrados para el periodo seleccionado.';
                            toast.warning(msg);
                            setIsGeneratingReport(false);
                            return;
                        }

                        if (formatoReporte === 'word') {
                            // Importar y usar la función de generación de DOCX
                            const { generateEstatusCasosDOCX } = await import('@/lib/utils/doc-generator');
                            await generateEstatusCasosDOCX(
                                result.data,
                                fechaInicio,
                                fechaFin,
                                term
                            );
                        } else {
                            // Importar y usar la función de generación de PDF con React PDF
                            const { generateEstatusCasosPDFReact } = await import('@/lib/utils/pdf-generator-react');
                            await generateEstatusCasosPDFReact(
                                result.data,
                                fechaInicio,
                                fechaFin,
                                term
                            );
                        }
                        if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                        toast.success('Reporte de estatus de casos descargado correctamente');


                        // Registrar auditoría
                        await registrarAuditoriaReporteAction({
                            tipoReporte: TIPOS_REPORTE.DISTRIBUCION_ESTATUS,
                            descripcion: DESCRIPCIONES_REPORTE[TIPOS_REPORTE.DISTRIBUCION_ESTATUS],
                            filtrosAplicados: {
                                fechaInicio,
                                fechaFin,
                                semestre: term
                            },
                            formato: formatoReporte === 'word' ? 'DOCX' : 'PDF'
                        });
                    } else {
                        toast.error('Error al generar el reporte: ' + (result.error || 'Error desconocido'));
                    }
                } else if (tipoReporteActual === 'Reporte Socioeconómico') {
                    // Generar reporte socioeconómico (paso a paso)
                    const { getInformeSocioeconomicoData } = await import('@/app/actions/reports');
                    const result = await getInformeSocioeconomicoData(
                        fechaInicio,
                        fechaFin,
                        term
                    );
                    if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                    if (result.success && result.data) {
                        // Verificar si hay datos (usamos género como indicador base)
                        const hasData = result.data.distribucionPorGenero && result.data.distribucionPorGenero.length > 0 &&
                            result.data.distribucionPorGenero.some(item => (item as any).cantidad_solicitantes > 0);

                        if (!hasData) {
                            const msg = term
                                ? `No hay casos registrados para el semestre ${term}.`
                                : 'No hay casos registrados para el periodo seleccionado.';
                            toast.warning(msg);
                            setIsGeneratingReport(false);
                            return;
                        }

                        if (formatoReporte === 'word') {

                            // Importar y usar la función de generación de DOCX
                            const { generateSocioeconomicoDOCX } = await import('@/lib/utils/docx/docx-socioeconomico');
                            await generateSocioeconomicoDOCX(
                                result.data,
                                fechaInicio,
                                fechaFin,
                                term
                            );
                        } else {
                            // Importar y usar la función de generación de PDF con React PDF
                            const { generateInformeSocioeconomicoPDF } = await import('@/lib/utils/pdf-generator-react');
                            await generateInformeSocioeconomicoPDF(
                                result.data,
                                fechaInicio,
                                fechaFin,
                                term
                            );
                        }
                        if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                        toast.success('Informe socioeconómico descargado correctamente');

                        // Registrar auditoría
                        await registrarAuditoriaReporteAction({
                            tipoReporte: TIPOS_REPORTE.INFORME_SOCIOECONOMICO,
                            descripcion: DESCRIPCIONES_REPORTE[TIPOS_REPORTE.INFORME_SOCIOECONOMICO],
                            filtrosAplicados: {
                                fechaInicio,
                                fechaFin,
                                semestre: term
                            },
                            formato: formatoReporte === 'word' ? 'DOCX' : 'PDF'
                        });
                    } else {
                        toast.error('Error al generar el reporte: ' + (result.error || 'Error desconocido'));
                    }
                } else {
                    // Generar reporte de tipos de caso (comportamiento original)
                    const { getCasosGroupedByAmbitoLegal } = await import('@/app/actions/reports');
                    const result = await getCasosGroupedByAmbitoLegal(
                        fechaInicio,
                        fechaFin,
                        term
                    );
                    if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                    if (result.success && result.data) {
                        // Verificar si hay datos para el reporte
                        if (result.data.length === 0 || result.data.every(item => item.cantidad_casos === 0)) {
                            const msg = term
                                ? `No hay casos registrados para el semestre ${term}.`
                                : 'No hay casos registrados para el periodo seleccionado.';
                            toast.warning(msg);
                            setIsGeneratingReport(false);
                            return;
                        }

                        if (formatoReporte === 'word') {
                            // Importar y usar la función de generación de DOCX
                            const { generateTiposCasosDOCX } = await import('@/lib/utils/doc-generator');
                            await generateTiposCasosDOCX(
                                result.data,
                                fechaInicio,
                                fechaFin,
                                term
                            );
                        } else {
                            // Importar y usar la función de generación de PDF con React PDF
                            const { generateTiposCasosPDFReact } = await import('@/lib/utils/pdf-generator-react');
                            await generateTiposCasosPDFReact(
                                result.data,
                                fechaInicio,
                                fechaFin,
                                term
                            );
                        }
                        if (controller.signal.aborted) { setIsGeneratingReport(false); return; }
                        toast.success('Reporte de tipos de caso descargado correctamente');

                        // Registrar auditoría - Tipos de Caso
                        await registrarAuditoriaReporteAction({
                            tipoReporte: TIPOS_REPORTE.DISTRIBUCION_TRAMITE,
                            descripcion: 'Tipos de Caso',
                            filtrosAplicados: {
                                fechaInicio,
                                fechaFin,
                                semestre: term
                            },
                            formato: formatoReporte === 'word' ? 'DOCX' : 'PDF'
                        });
                    } else {
                        toast.error('Error al generar el reporte: ' + (result.error || 'Error desconocido'));
                    }
                }
            } catch (error) {
                logger.error('Error al generar reporte:', error);
                toast.error('Error al generar el reporte. Por favor, intente nuevamente.');
            } finally {
                setIsGeneratingReport(false);
            }
        }, 100);
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
        <div className="w-full overflow-x-hidden max-w-full">
            {/* Header */}
            <div className="mb-4 md:mb-6 mt-4">
                <h1 className="text-4xl m-3 font-semibold text-[var(--foreground)] transition-colors" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    Reportes
                </h1>
                <p className="mb-6 ml-3 text-sm sm:text-base text-[var(--card-text-muted)] transition-colors" style={{ fontFamily: 'var(--font-urbanist)' }}>
                    Presentación de las métricas clave a través de gráficas y cuadros.
                </p>
            </div>

            <div className="px-3 md:px-1 space-y-6">
                {/* Report Generation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[10rem] gap-4 md:gap-6 mb-6 w-full min-w-0">
                    {/* 1. Resumen de Casos (Normal Card) */}
                    <ReportCard
                        title="Resumen de Casos"
                        icon={<FileBarChart className="w-full h-full" strokeWidth={1.5} />}
                        onGenerate={() => handleGenerateReport('Resumen de Casos')}
                        buttonColor="red"
                    />

                    {/* 2. Estatus de Casos (Top Right) */}
                    <ReportCard
                        title="Estatus de Casos"
                        icon={<Clock className="w-full h-full" strokeWidth={1.5} />}
                        onGenerate={() => handleGenerateReport('Estatus de Casos')}
                        buttonColor="orange"
                    />

                    {/* 3. Tipos de Caso (Middle Right) */}
                    <ReportCard
                        title="Tipos de Caso"
                        icon={<Briefcase className="w-full h-full" strokeWidth={1.5} />}
                        onGenerate={() => handleGenerateReport('Tipos de Caso')}
                        buttonColor="red"
                    />


                    {/* 4. Historial de Casos (Bottom Row) */}
                    <ReportCard
                        title="Historial de Casos del Solicitante"
                        icon={<History className="w-full h-full" strokeWidth={1.5} />}
                        onGenerate={() => handleGenerateReport('Historial de Casos del Solicitante')}
                        buttonColor="orange"
                    />

                    {/* 5. Ficha Resumen (Bottom Row) */}
                    <ReportCard
                        title="Ficha Resumen del Solicitante"
                        icon={<User className="w-full h-full" strokeWidth={1.5} />}
                        onGenerate={() => handleGenerateReport('Ficha Resumen del Solicitante')}
                        buttonColor="red"
                    />

                    {/* 6. Reporte Socioeconómico (Bottom Row) */}
                    <ReportCard
                        title="Reporte Socioeconómico"
                        icon={<Home className="w-full h-full" strokeWidth={1.5} />}
                        onGenerate={() => handleGenerateReport('Reporte Socioeconómico')}
                        buttonColor="orange"
                    />
                </div>

                {/* Filter Bar with View Switcher */}
                <div>
                    <FilterBar
                        filters={filters}
                        onFilterChange={setFilters}
                    />
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Dynamic Content Area */}
                <motion.div
                    className="transition-all duration-300 mt-6"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                >
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6 shadow-sm h-96 animate-pulse transition-colors">
                                    <div className="h-6 bg-[var(--sidebar-hover)] rounded w-1/2 mx-auto mb-4 opacity-50"></div>
                                    <div className="h-64 bg-[var(--ui-bg-muted)] rounded opacity-50"></div>
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
                                <TramiteDistributionChart data={tramiteDistributionData} />
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Modal para seleccionar rango de fechas del reporte */}
            <Modal
                isOpen={showDateModal}
                onClose={handleCloseModal}
                size={supportsPreview ? 'custom' : 'md'}
                className={supportsPreview ? 'max-w-6xl' : ''}
                showCloseButton={false}
            >
                <div className={`relative flex flex-col ${supportsPreview ? 'lg:flex-row' : ''} h-full`}>
                    {/* Botón de cerrar */}
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-2 right-4 p-2 text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] rounded-md transition-colors z-50 cursor-pointer"
                        aria-label="Cerrar modal"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Left Column: Form */}
                    <div className={`flex-shrink-0 p-6 ${supportsPreview ? 'lg:w-[380px] lg:border-r border-[var(--card-border)]' : 'w-full'}`}>


                        {/* Título */}
                        <h2 className="text-xl font-normal text-foreground mb-4">
                            {tipoReporteActual === 'Estatus de Casos'
                                ? 'Rango de Fechas - Estatus de Casos'
                                : tipoReporteActual === 'Resumen de Casos'
                                    ? 'Rango de Fechas - Resumen de Casos'
                                    : tipoReporteActual === 'Historial de Casos del Solicitante'
                                        ? 'Generar Historial del Solicitante'
                                        : tipoReporteActual === 'Ficha Resumen del Solicitante'
                                            ? 'Generar Ficha Resumen'
                                            : tipoReporteActual === 'Reporte Socioeconómico'
                                                ? 'Rango de Fechas - Socioeconómico'
                                                : 'Rango de Fechas - Tipos de Caso'}
                        </h2>

                        {/* Tabs para Resumen de Casos y Reporte Socioeconómico */}
                        {(tipoReporteActual === 'Resumen de Casos' || tipoReporteActual === 'Reporte Socioeconómico') && (
                            <div className="border-b border-[var(--card-border)] mb-6">
                                <div className="flex gap-1 w-full">
                                    <button
                                        onClick={() => setActiveTab('filtros')}
                                        className={`
                                            flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 text-center cursor-pointer
                                            ${activeTab === 'filtros'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:border-[var(--card-text-muted)]'
                                            }
                                        `}
                                    >
                                        Filtros
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('secciones')}
                                        className={`
                                            flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 text-center cursor-pointer
                                            ${activeTab === 'secciones'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-[var(--card-text-muted)] hover:text-[var(--foreground)] hover:border-[var(--card-text-muted)]'
                                            }
                                        `}
                                    >
                                        Secciones
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Grid de formulario */}
                        <div className={`grid-cols-1 gap-4 mb-4 ${activeTab === 'filtros' || (tipoReporteActual !== 'Resumen de Casos' && tipoReporteActual !== 'Reporte Socioeconómico') ? 'grid' : 'hidden'}`}>
                            {/* Selector de Solicitante (Solo visible para Historial de Solicitante y Ficha Resumen) */}
                            {(tipoReporteActual === 'Historial de Casos del Solicitante' || tipoReporteActual === 'Ficha Resumen del Solicitante') && (
                                <div className="mb-4 relative">
                                    <label className="text-base font-normal text-foreground mb-1 block">
                                        Buscar Solicitante <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, apellido o cédula..."
                                            className="w-full p-2 border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                                            value={solicitanteSearch}
                                            onChange={(e) => {
                                                setSolicitanteSearch(e.target.value);
                                                setShowSolicitanteDropdown(true);
                                                if (!e.target.value && selectedSolicitante) {
                                                    setSelectedSolicitante(null);
                                                }
                                            }}
                                            onClick={() => setShowSolicitanteDropdown(true)}
                                        />
                                        {isLoadingSolicitantes && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <Spinner size="sm" className="w-4 h-4 text-gray-400 border-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {showSolicitanteDropdown && filteredSolicitantes.length > 0 && (
                                        <div className="absolute z-100 w-full mt-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {filteredSolicitantes.map((solicitante) => (
                                                <div
                                                    key={solicitante.cedula}
                                                    className="p-2 hover:bg-[var(--sidebar-hover)] cursor-pointer flex flex-col border-b border-[var(--card-border)] last:border-0"
                                                    onClick={() => {
                                                        setSelectedSolicitante(solicitante);
                                                        setSolicitanteSearch(`${solicitante.nombre_completo} (${solicitante.cedula})`);
                                                        setShowSolicitanteDropdown(false);
                                                    }}
                                                >
                                                    <span className="font-medium text-[var(--card-text)] transition-colors">{solicitante.nombre_completo}</span>
                                                    <span className="text-xs text-[var(--card-text-muted)] transition-colors">{solicitante.cedula}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {showSolicitanteDropdown && filteredSolicitantes.length === 0 && !isLoadingSolicitantes && (
                                        <div className="absolute z-50 w-full mt-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md shadow-lg p-2 text-center text-[var(--card-text-muted)] text-sm">
                                            No se encontraron resultados
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Opción por Semestre */}
                            <div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-base font-normal text-foreground mb-1">
                                        Por Semestre (Periodo)
                                    </label>
                                    <Select
                                        options={termOptions}
                                        value={selectedTermReporte}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            setSelectedTermReporte(e.target.value);
                                            if (e.target.value !== 'all') {
                                                setFechaInicioReporte('');
                                                setFechaFinReporte('');
                                            }
                                            setDateError(null);
                                        }}
                                        placeholder="Seleccionar Semestre"
                                        icon={<Calendar className="w-5 h-5 text-[var(--card-text-muted)] opacity-70 transition-colors" />}
                                    />
                                </div>
                            </div>


                            <div className="relative py-2 flex items-center">
                                <div className="grow border-t border-[var(--card-border)] transition-colors"></div>
                                <span className="shrink mx-4 text-[var(--card-text-muted)] text-sm transition-colors">O por rango de fechas</span>
                                <div className="grow border-t border-[var(--card-border)] transition-colors"></div>
                            </div>

                            {(tipoReporteActual === 'Historial de Casos del Solicitante' || tipoReporteActual === 'Ficha Resumen del Solicitante') && selectedTermReporte === 'all' && (
                                <div className="text-gray-500 text-sm mb-2 font-medium">Filtrar por fechas (Opcional):</div>
                            )}


                            {/* Fecha de Inicio */}
                            <div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-base font-normal text-foreground mb-1">
                                        Fecha de Inicio
                                    </label>
                                    <div className="relative">
                                        <DatePicker
                                            value={fechaInicioReporte}
                                            onChange={(value) => {
                                                setFechaInicioReporte(value);
                                                setSelectedTermReporte('all');
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
                                        <DatePicker
                                            value={fechaFinReporte}
                                            onChange={(value) => {
                                                setFechaFinReporte(value);
                                                setSelectedTermReporte('all');
                                                setDateError(null);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configuración de Secciones para Resumen de Casos */}
                        {tipoReporteActual === 'Resumen de Casos' && activeTab === 'secciones' && (
                            <div className="mb-6">
                                <label className="text-base font-normal text-foreground mb-3 block">
                                    Secciones a incluir en el reporte
                                </label>
                                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-1">
                                    {Object.entries(RESUMEN_SECCIONES_LABELS).map(([key, label]) => {
                                        const isChecked = selectedResumenSections[key as keyof ResumenSectionsData];
                                        return (
                                            <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-[var(--sidebar-hover)] rounded-md border border-[var(--card-border)] transition-colors select-none group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleResumenSection(key as keyof ResumenSectionsData)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`
                                                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                                        ${isChecked
                                                            ? 'bg-primary border-primary'
                                                            : 'bg-[var(--card-bg)] border-[var(--card-border)] group-hover:border-[var(--card-text-muted)]'
                                                        }
                                                    `}>
                                                        {isChecked && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-sm transition-colors ${isChecked ? 'text-[var(--foreground)] font-medium' : 'text-[var(--card-text)] group-hover:text-[var(--foreground)]'}`}>{label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-3 mt-3 text-xs font-medium px-1">
                                    <span
                                        className="text-primary hover:opacity-80 cursor-pointer transition-opacity"
                                        onClick={() => setSelectedResumenSections(Object.keys(RESUMEN_SECCIONES_LABELS).reduce((acc, key) => ({ ...acc, [key]: true }), {} as ResumenSectionsData))}
                                    >
                                        Marcar todas
                                    </span>
                                    <span className="text-[var(--card-border)] transition-colors">|</span>
                                    <span
                                        className="text-[var(--card-text-muted)] hover:text-[var(--foreground)] cursor-pointer transition-colors"
                                        onClick={() => setSelectedResumenSections(Object.keys(RESUMEN_SECCIONES_LABELS).reduce((acc, key) => ({ ...acc, [key]: false }), {} as ResumenSectionsData))}
                                    >
                                        Desmarcar todas
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Configuración de Secciones para Reporte Socioeconómico */}
                        {tipoReporteActual === 'Reporte Socioeconómico' && activeTab === 'secciones' && (
                            <div className="mb-6">
                                <label className="text-base font-normal text-foreground mb-3 block">
                                    Secciones a incluir en el reporte
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                    <div className="md:col-span-2 pb-2 mb-2 border-b border-[var(--card-border)] transition-colors">
                                        <h4 className="font-semibold text-[var(--foreground)] transition-colors">Datos Demográficos</h4>
                                    </div>
                                    {[
                                        { key: 'genero', label: 'Género' },
                                        { key: 'edad', label: 'Rango de Edad' },
                                        { key: 'estadoCivil', label: 'Estado Civil' },
                                        { key: 'nivelEducativo', label: 'Nivel Educativo' }
                                    ].map(({ key, label }) => {
                                        const isChecked = selectedSocioeconomicoSections[key as keyof SocioeconomicoSectionsData];
                                        return (
                                            <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-[var(--sidebar-hover)] rounded-md border border-[var(--card-border)] transition-colors select-none group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleSocioeconomicoSection(key as keyof SocioeconomicoSectionsData)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`
                                                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                                        ${isChecked
                                                            ? 'bg-primary border-primary'
                                                            : 'bg-[var(--card-bg)] border-[var(--card-border)] group-hover:border-[var(--card-text-muted)]'
                                                        }
                                                    `}>
                                                        {isChecked && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-sm transition-colors ${isChecked ? 'text-[var(--foreground)] font-medium' : 'text-[var(--card-text)] group-hover:text-[var(--foreground)]'}`}>{label}</span>
                                            </label>
                                        );
                                    })}

                                    <div className="md:col-span-2 pb-2 mb-2 mt-4 border-b border-[var(--card-border)] transition-colors">
                                        <h4 className="font-semibold text-[var(--foreground)] transition-colors">Situación Económica</h4>
                                    </div>
                                    {[
                                        { key: 'condicionTrabajo', label: 'Condición de Trabajo' },
                                        { key: 'ingresos', label: 'Rangos de Ingresos' }
                                    ].map(({ key, label }) => {
                                        const isChecked = selectedSocioeconomicoSections[key as keyof SocioeconomicoSectionsData];
                                        return (
                                            <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-[var(--sidebar-hover)] rounded-md border border-[var(--card-border)] transition-colors select-none group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleSocioeconomicoSection(key as keyof SocioeconomicoSectionsData)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`
                                                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                                        ${isChecked
                                                            ? 'bg-primary border-primary'
                                                            : 'bg-[var(--card-bg)] border-[var(--card-border)] group-hover:border-[var(--card-text-muted)]'
                                                        }
                                                    `}>
                                                        {isChecked && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-sm transition-colors ${isChecked ? 'text-[var(--foreground)] font-medium' : 'text-[var(--card-text)] group-hover:text-[var(--foreground)]'}`}>{label}</span>
                                            </label>
                                        );
                                    })}

                                    <div className="md:col-span-2 pb-2 mb-2 mt-4 border-b border-[var(--card-border)] transition-colors">
                                        <h4 className="font-semibold text-[var(--foreground)] transition-colors">Vivienda y Hogar</h4>
                                    </div>
                                    {[
                                        { key: 'tamanoHogar', label: 'Tamaño del Hogar' },
                                        { key: 'ninosHogar', label: 'Niños en el Hogar' },
                                        { key: 'trabajadoresHogar', label: 'Trabajadores en el Hogar' },
                                        { key: 'dependientes', label: 'Dependientes en el Hogar' },
                                        { key: 'habitaciones', label: 'Cantidad de Habitaciones' },
                                        { key: 'banos', label: 'Cantidad de Baños' },
                                        { key: 'aguaPotable', label: 'Agua Potable' },
                                        { key: 'aseoUrbano', label: 'Aseo' },
                                        { key: 'aguasNegras', label: 'Eliminación Aguas Negras' },
                                        { key: 'artefactosHogar', label: 'Artefactos Domésticos' },
                                        { key: 'materialParedes', label: 'Material Paredes' },
                                        { key: 'materialPiso', label: 'Material Piso' },
                                        { key: 'materialTecho', label: 'Material Techo' },
                                        { key: 'tipoVivienda', label: 'Tipo Vivienda' }
                                    ].map(({ key, label }) => {
                                        const isChecked = selectedSocioeconomicoSections[key as keyof SocioeconomicoSectionsData];
                                        return (
                                            <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-[var(--sidebar-hover)] rounded-md border border-[var(--card-border)] transition-colors select-none group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleSocioeconomicoSection(key as keyof SocioeconomicoSectionsData)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`
                                                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                                        ${isChecked
                                                            ? 'bg-primary border-primary'
                                                            : 'bg-[var(--card-bg)] border-[var(--card-border)] group-hover:border-[var(--card-text-muted)]'
                                                        }
                                                    `}>
                                                        {isChecked && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-sm transition-colors ${isChecked ? 'text-[var(--foreground)] font-medium' : 'text-[var(--card-text)] group-hover:text-[var(--foreground)]'}`}>{label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-3 mt-3 text-xs font-medium px-1">
                                    <span
                                        className="text-primary hover:opacity-80 cursor-pointer transition-opacity"
                                        onClick={() => setSelectedSocioeconomicoSections(Object.keys(selectedSocioeconomicoSections).reduce((acc, key) => ({ ...acc, [key]: true }), {} as SocioeconomicoSectionsData))}
                                    >
                                        Marcar todas
                                    </span>
                                    <span className="text-[var(--card-border)] transition-colors">|</span>
                                    <span
                                        className="text-[var(--card-text-muted)] hover:text-[var(--foreground)] cursor-pointer transition-colors"
                                        onClick={() => setSelectedSocioeconomicoSections(Object.keys(selectedSocioeconomicoSections).reduce((acc, key) => ({ ...acc, [key]: false }), {} as SocioeconomicoSectionsData))}
                                    >
                                        Desmarcar todas
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Selector de Formato - Ocultar para Historial, Ficha Resumen y Pestañas de Secciones */}
                        {tipoReporteActual !== 'Historial de Casos del Solicitante' && tipoReporteActual !== 'Ficha Resumen del Solicitante' && ((activeTab === 'filtros' && (tipoReporteActual === 'Resumen de Casos' || tipoReporteActual === 'Reporte Socioeconómico')) || (tipoReporteActual !== 'Resumen de Casos' && tipoReporteActual !== 'Reporte Socioeconómico')) && (
                            <div className="mb-6">
                                <label className="text-base font-normal text-foreground mb-3 block">
                                    Formato de descarga
                                </label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="formato"
                                                value="pdf"
                                                checked={formatoReporte === 'pdf'}
                                                onChange={() => setFormatoReporte('pdf')}
                                                className="appearance-none w-5 h-5 rounded-full border-2 border-[var(--card-border)] checked:border-primary bg-[var(--card-bg)] transition-all cursor-pointer"
                                            />
                                            {formatoReporte === 'pdf' && (
                                                <div className="absolute w-2.5 h-2.5 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <span className={`text-sm ${formatoReporte === 'pdf' ? 'text-primary font-medium' : 'text-[var(--card-text)]'}`}>PDF (.pdf)</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="formato"
                                                value="word"
                                                checked={formatoReporte === 'word'}
                                                onChange={() => setFormatoReporte('word')}
                                                className="appearance-none w-5 h-5 rounded-full border-2 border-[var(--card-border)] checked:border-primary bg-[var(--card-bg)] transition-all cursor-pointer"
                                            />
                                            {formatoReporte === 'word' && (
                                                <div className="absolute w-2.5 h-2.5 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <span className={`text-sm ${formatoReporte === 'word' ? 'text-primary font-medium' : 'text-[var(--card-text)]'}`}>Word (.docx)</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Mensaje informativo sobre histórico */}
                        {((activeTab === 'filtros' && (tipoReporteActual === 'Resumen de Casos' || tipoReporteActual === 'Reporte Socioeconómico')) || (tipoReporteActual !== 'Resumen de Casos' && tipoReporteActual !== 'Reporte Socioeconómico')) && (
                            <p className="text-sm text-gray-500 mb-4">
                                {tipoReporteActual === 'Historial de Casos del Solicitante' || tipoReporteActual === 'Ficha Resumen del Solicitante'
                                    ? 'Si no selecciona fechas, se descargará el historial completo de todos los casos del solicitante en formato ZIP.'
                                    : 'Si no selecciona semestre ni fechas, se generará un reporte histórico con todos los casos.'}
                            </p>
                        )}

                        {/* Mensaje de error */}
                        {dateError && ((activeTab === 'filtros' && (tipoReporteActual === 'Resumen de Casos' || tipoReporteActual === 'Reporte Socioeconómico')) || (tipoReporteActual !== 'Resumen de Casos' && tipoReporteActual !== 'Reporte Socioeconómico')) && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                {dateError}
                            </div>
                        )}

                        {/* Footer con botón */}
                        <div className="flex flex-col border-t border-[var(--card-border)] pt-4">
                            <div className="flex justify-end gap-3">
                                <Button
                                    onClick={handleCloseModal}
                                    variant="outline"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleGenerateTiposCasosReport}
                                    variant="primary"
                                >
                                    {tipoReporteActual === 'Historial de Casos del Solicitante' || tipoReporteActual === 'Ficha Resumen del Solicitante' ? 'Descargar Expediente' : 'Generar Reporte'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Real PDF Preview (only for supported report types) */}
                    {supportsPreview && (
                        <div className="hidden lg:flex flex-col flex-1 min-w-0 rounded-r-xl overflow-hidden border-l border-[var(--card-border)]/50 relative">


                            <ReportPreview
                                generatePreviewBlob={generatePreviewBlob}
                                previewKey={`${tipoReporteActual}-${selectedTermReporte}-${fechaInicioReporte}-${fechaFinReporte}-${formatoReporte}-${JSON.stringify(selectedResumenSections)}-${JSON.stringify(selectedSocioeconomicoSections)}`}
                                reportType={tipoReporteActual}
                                accentColor="#9c2327"
                                onPreviewGenerated={handlePreviewGenerated}
                                icon={
                                    tipoReporteActual === 'Resumen de Casos' ? <FileBarChart className="w-10 h-10 opacity-80" style={{ color: '#9c2327' }} />
                                        : tipoReporteActual === 'Estatus de Casos' ? <Clock className="w-10 h-10 opacity-80" style={{ color: '#9c2327' }} />
                                            : tipoReporteActual === 'Tipos de Caso' ? <Briefcase className="w-10 h-10 opacity-80" style={{ color: '#9c2327' }} />
                                                : tipoReporteActual === 'Historial de Casos del Solicitante' ? <History className="w-10 h-10 opacity-80" style={{ color: '#9c2327' }} />
                                                    : tipoReporteActual === 'Ficha Resumen del Solicitante' ? <User className="w-10 h-10 opacity-80" style={{ color: '#9c2327' }} />
                                                        : tipoReporteActual === 'Reporte Socioeconómico' ? <Home className="w-10 h-10 opacity-80" style={{ color: '#9c2327' }} />
                                                            : undefined
                                }
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {/* Pantalla de carga para generación de reporte */}
            <AnimatePresence>
                {isGeneratingReport && (
                    <motion.div
                        className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="bg-[var(--card-bg)] p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-[var(--card-border)]"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <Spinner />
                            <div className="flex flex-col items-center text-center">
                                <h3 className="text-xl font-semibold text-[var(--foreground)]">Generando Reporte</h3>
                                <p className="text-[var(--card-text-muted)]">Por favor, espera un momento...</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
