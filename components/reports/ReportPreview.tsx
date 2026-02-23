'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import Spinner from '@/components/ui/feedback/Spinner';
import Button from '@/components/ui/Button';

interface ReportPreviewProps {
    /** Function that generates a PDF blob for preview. Receives an AbortSignal to support cancellation. */
    generatePreviewBlob: (signal: AbortSignal) => Promise<Blob | null>;
    /** Key to trigger re-generation when parameters change */
    previewKey?: string;
    /** Whether to auto-generate preview on mount */
    autoGenerate?: boolean;
    /** Report type label for the empty state */
    reportType?: string;
    /** Accent color for styling */
    accentColor?: string;
    /** Custom icon to display in idle state */
    icon?: React.ReactNode;
    /** Callback fired when a preview is successfully generated */
    onPreviewGenerated?: () => void;
}

type PreviewState = 'idle' | 'loading' | 'ready' | 'error' | 'empty' | 'no_sections';

export default function ReportPreview({
    generatePreviewBlob,
    previewKey = '',
    autoGenerate = false,
    reportType = 'Reporte',
    accentColor = '#9c2327',
    icon,
    onPreviewGenerated,
}: ReportPreviewProps) {
    const [state, setState] = useState<PreviewState>('idle');
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const blobUrlRef = useRef<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Cancel any ongoing generation
    const cancelGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    // Cleanup blob URL and cancel on unmount
    useEffect(() => {
        return () => {
            cancelGeneration();
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [cancelGeneration]);

    // Reset preview when the key changes (parameters changed)
    useEffect(() => {
        // Always reset to idle when parameters change so user can generate again
        // or auto-generate if we implement that logic later.
        cancelGeneration();

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
            setBlobUrl(null);
        }

        // If we are already idle, no need to set state, but if we are in any other state
        // (including error, empty, no_sections), we should reset to idle.
        if (state !== 'idle') {
            setState('idle');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewKey]);

    const handleGeneratePreview = useCallback(async () => {
        // Cancel any previous in-flight generation
        cancelGeneration();

        // Create a new AbortController for this generation
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setState('loading');
        setErrorMsg('');

        try {
            // Revocar URL anterior si existe
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }

            const blob = await generatePreviewBlob(controller.signal);

            // Check if aborted after awaiting
            if (controller.signal.aborted) return;

            if (blob?.type === 'application/no-sections') {
                setState('no_sections');
                return;
            }

            if (!blob || blob.size === 0) {
                setState('empty');
                return;
            }

            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url;
            setBlobUrl(url);
            setState('ready');

            // Notify parent that preview was generated
            onPreviewGenerated?.();

        } catch (err: any) {
            // If aborted, silently ignore (user closed modal or changed params)
            if (controller.signal.aborted) return;

            console.error('Error generating preview:', err);
            setState('error');
            setErrorMsg('Error al generar la vista previa. Intente nuevamente.');
        }
    }, [generatePreviewBlob, cancelGeneration]);

    // Auto-generate on mount if enabled
    useEffect(() => {
        if (autoGenerate && state === 'idle') {
            handleGeneratePreview();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoGenerate]);

    const [zoomLevel, setZoomLevel] = useState(100);

    // Reset zoom when preview changes
    useEffect(() => {
        setZoomLevel(100);
    }, [previewKey]);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
    const handleResetZoom = () => setZoomLevel(100);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Toolbar - Only shown when preview is ready */}
            {state === 'ready' && (
                <div className="flex items-center justify-center gap-3 px-4 py-2 border-b border-gray-200 bg-white z-10 shadow-sm select-none">

                    {/* Block 1: Zoom Controls */}
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
                        <button
                            onClick={handleZoomOut}
                            className="p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
                            title="Reducir zoom"
                            disabled={zoomLevel <= 50}
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                        </button>

                        <span className="text-xs font-semibold w-12 text-center text-gray-700 mx-1 font-mono">
                            {zoomLevel}%
                        </span>

                        <button
                            onClick={handleZoomIn}
                            className="p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
                            title="Aumentar zoom"
                            disabled={zoomLevel >= 200}
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                        </button>

                        <div className="w-px h-4 bg-gray-300 mx-1"></div>

                        <button
                            onClick={handleResetZoom}
                            className="px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-primary hover:bg-white hover:shadow-sm rounded transition-all uppercase tracking-wide"
                            title="Restablecer zoom (100%)"
                            type="button"
                        >
                            Restablecer
                        </button>
                    </div>

                    {/* Block 2: Regenerate Button */}
                    <button
                        onClick={handleGeneratePreview}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 shadow-sm hover:text-primary hover:bg-white hover:shadow transition-all h-[34px]"
                        title="Regenerar vista previa"
                        type="button"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Regenerar</span>
                    </button>
                </div>
            )}

            {/* Preview Area */}
            <div className="flex-1 relative overflow-hidden bg-gray-100/50">
                <AnimatePresence mode="wait">
                    {/* Idle State */}
                    {state === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 bg-white"
                            >
                                {icon || <FileText className="w-10 h-10 opacity-80" style={{ color: accentColor }} />}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2 font-primary opacity-90">
                                {reportType}
                            </h3>
                            <p className="text-sm text-gray-500 mb-8 max-w-[280px] leading-relaxed">
                                Configure los parámetros necesarios en el panel izquierdo y genere la vista previa del documento.
                            </p>
                            <Button
                                onClick={handleGeneratePreview}
                                className="shadow-md hover:shadow-lg transition-all active:scale-95"
                                style={{ backgroundColor: accentColor, borderColor: accentColor }}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Generar Vista Previa
                            </Button>
                        </motion.div>
                    )}

                    {/* Loading State */}
                    {state === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white/50 backdrop-blur-sm"
                        >
                            <div className="relative mb-10">
                                <Spinner size="lg" className="w-12 h-12" />
                            </div>
                            <div className="flex flex-col items-center text-center gap-1">
                                <p className="text-base font-medium text-gray-700 font-primary">Generando vista previa...</p>
                                <p className="text-sm text-gray-400">Esto puede tomar unos segundos</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Ready State - PDF iframe with Zoom */}
                    {state === 'ready' && blobUrl && (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute inset-0 overflow-auto bg-gray-200 flex flex-col items-center p-4 transition-all"
                        >
                            <div
                                style={{
                                    width: `${zoomLevel}%`,
                                    height: '100%',
                                    minHeight: '100%',
                                    transition: 'width 0.2s ease-out'
                                }}
                                className="shadow-lg bg-white relative"
                            >
                                <iframe
                                    src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                                    className="w-full h-full border-0 bg-white"
                                    title="Vista previa del reporte"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Error State */}
                    {state === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6 border border-red-100">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 font-primary">
                                Error al generar vista previa
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-[300px]">
                                {errorMsg}
                            </p>
                            <Button
                                onClick={handleGeneratePreview}
                                variant="danger"
                                className="shadow-md"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Intentar de Nuevo
                            </Button>
                        </motion.div>
                    )}

                    {/* Empty State (No Data) */}
                    {state === 'empty' && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 font-primary">
                                Sin resultados
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-[300px]">
                                No se encontraron datos para los filtros seleccionados. Intente con otros criterios.
                            </p>
                            <Button
                                onClick={handleGeneratePreview}
                                className="shadow-md hover:shadow-lg transition-all active:scale-95 text-white"
                                style={{ backgroundColor: accentColor, borderColor: accentColor }}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Actualizar
                            </Button>
                        </motion.div>
                    )}

                    {/* No Sections Selected State */}
                    {state === 'no_sections' && (
                        <motion.div
                            key="no_sections"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6 border border-red-100">
                                <AlertCircle className="w-8 h-8" style={{ color: '#9c2327' }} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 font-primary">
                                Sin secciones seleccionadas
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-[300px]">
                                Por favor seleccione al menos una sección para generar la vista previa.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}
