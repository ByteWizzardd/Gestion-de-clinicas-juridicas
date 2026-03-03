'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Archive, AlertTriangle, CheckCircle2, Loader2, Calendar, User, Briefcase } from 'lucide-react';
import Modal from '@/components/ui/feedback/Modal';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import { getInactiveCasesAction, archiveInactiveCasesAction, InactiveCase } from '@/app/actions/casos';

interface ArchiveInactiveCasesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onArchiveComplete?: () => void;
}

export default function ArchiveInactiveCasesModal({
    isOpen,
    onClose,
    onArchiveComplete,
}: ArchiveInactiveCasesModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inactiveCases, setInactiveCases] = useState<InactiveCase[]>([]);
    const [selectedCases, setSelectedCases] = useState<Set<number>>(new Set());
    const [archiving, setArchiving] = useState(false);

    // Cargar casos inactivos al abrir el modal
    useEffect(() => {
        if (isOpen) {
            loadInactiveCases();
        }
    }, [isOpen]);

    const loadInactiveCases = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getInactiveCasesAction(12); // 12 meses = 2 semestres
            if (result.success && result.data) {
                setInactiveCases(result.data);
                // Por defecto, seleccionar todos
                setSelectedCases(new Set(result.data.map(c => c.id_caso)));
            } else {
                setError(result.error?.message || 'Error al cargar casos inactivos');
            }
        } catch (err) {
            setError('Error al cargar casos inactivos');
        } finally {
            setLoading(false);
        }
    };

    const toggleCaseSelection = (id: number) => {
        const newSelected = new Set(selectedCases);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedCases(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedCases.size === inactiveCases.length) {
            setSelectedCases(new Set());
        } else {
            setSelectedCases(new Set(inactiveCases.map(c => c.id_caso)));
        }
    };

    const handleArchive = async () => {
        if (selectedCases.size === 0) {
            toast.warning('Selecciona al menos un caso para archivar', 'Selección requerida');
            return;
        }

        setArchiving(true);
        try {
            const result = await archiveInactiveCasesAction(Array.from(selectedCases));
            if (result.success && result.data) {
                toast.success(result.data.mensaje, 'Casos archivados');
                onArchiveComplete?.();
                onClose();
            } else {
                toast.error(result.error?.message || 'Error al archivar casos', 'Error');
            }
        } catch (err) {
            toast.error('Error al archivar casos', 'Error inesperado');
        } finally {
            setArchiving(false);
        }
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return date.toLocaleDateString('es-VE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Archivar Casos Inactivos"
            size="custom"
            className="w-[95vw] sm:w-[90vw] lg:w-[85vw] max-w-4xl"
        >
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Información */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex items-start gap-3 transition-colors">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-300">Casos inactivos por más de 2 semestres</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400/90 mt-1">
                            Los siguientes casos no han tenido ninguna actividad (cambios de estatus, citas, acciones, documentos o actualizaciones)
                            en los últimos 12 meses. Se recomienda archivarlos para mantener organizado el sistema.
                        </p>
                    </div>
                </div>

                {/* Estado de carga */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="text-[var(--card-text-muted)]">Buscando casos inactivos...</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={loadInactiveCases}
                            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Sin casos inactivos */}
                {!loading && !error && inactiveCases.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h4 className="text-lg font-medium text-[var(--foreground)]">¡Excelente!</h4>
                        <p className="text-[var(--card-text-muted)] mt-2">
                            No hay casos inactivos que requieran archivo.
                        </p>
                    </div>
                )}

                {/* Lista de casos */}
                {!loading && !error && inactiveCases.length > 0 && (
                    <>
                        {/* Header con seleccionar todos */}
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedCases.size === inactiveCases.length}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 text-primary border-[var(--ui-border)] bg-[var(--background)] rounded focus:ring-primary transition-colors"
                                />
                                <span className="text-sm font-medium text-[var(--foreground)]">
                                    Seleccionar todos ({inactiveCases.length} casos)
                                </span>
                            </label>
                            <span className="text-sm text-[var(--card-text-muted)]">
                                {selectedCases.size} seleccionado(s)
                            </span>
                        </div>

                        {/* Lista de casos */}
                        <div className="space-y-3">
                            <AnimatePresence>
                                {inactiveCases.map((caso, index) => (
                                    <motion.div
                                        key={caso.id_caso}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`
                      border rounded-lg p-4 cursor-pointer transition-all
                      ${selectedCases.has(caso.id_caso)
                                                ? 'border-primary bg-primary-light/20 dark:bg-primary/20'
                                                : 'border-[var(--card-border)] hover:border-[var(--ui-border)] bg-[var(--card-bg)]'
                                            }
                    `}
                                        onClick={() => toggleCaseSelection(caso.id_caso)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedCases.has(caso.id_caso)}
                                                onChange={() => toggleCaseSelection(caso.id_caso)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Briefcase className="w-4 h-4 text-primary" />
                                                    <span className="font-semibold text-[var(--foreground)]">
                                                        Caso #{caso.id_caso}
                                                    </span>
                                                    <span className={`
                            px-2 py-0.5 rounded-full text-xs font-medium
                            ${caso.estatus === 'En proceso' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                            ${caso.estatus === 'Asesoría' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                            ${caso.estatus === 'Entregado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                          `}>
                                                        {caso.estatus}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                        {Math.floor(caso.meses_inactividad)} meses inactivo
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[var(--card-text-muted)] mb-2">
                                                    {caso.tramite} • {caso.nombre_materia}
                                                </p>
                                                <div className="flex flex-wrap gap-4 text-xs text-[var(--card-text-muted)] opacity-80">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        <span>{caso.nombre_completo_solicitante}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Última actividad: {formatDate(caso.fecha_ultima_actividad)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            {!loading && !error && inactiveCases.length > 0 && (
                <div className="border-t border-[var(--card-border)] p-4 flex justify-end gap-3 transition-colors">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-[var(--card-text-muted)] bg-[var(--ui-bg-inactive)] dark:bg-[var(--sidebar-hover)] rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors cursor-pointer"
                        disabled={archiving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleArchive}
                        disabled={selectedCases.size === 0 || archiving}
                        className={`
              px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
              ${selectedCases.size === 0 || archiving
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                            }
            `}
                    >
                        {archiving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Archivando...
                            </>
                        ) : (
                            <>
                                <Archive className="w-4 h-4" />
                                Archivar {selectedCases.size} caso(s)
                            </>
                        )}
                    </button>
                </div>
            )}
        </Modal>
    );
}
