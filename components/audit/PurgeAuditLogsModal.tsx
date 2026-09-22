'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, Loader2, Calendar, Trash2, Archive } from 'lucide-react';
import Modal from '@/components/ui/feedback/Modal';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import {
    simularPurgaAuditoriaAction,
    purgarAuditoriaAction,
} from '@/app/actions/audit-retencion.actions';
import type { ClaseRetencion, ResultadoPurga } from '@/lib/db/queries/auditoria-retencion.queries';

interface PurgeAuditLogsModalProps {
    isOpen: boolean;
    clases: ClaseRetencion[];
    onClose: () => void;
    onPurgeComplete?: () => void;
}

function formatearFecha(fecha: string | null): string {
    if (!fecha) return 'N/A';
    const [anio, mes, dia] = fecha.split('-').map(Number);
    if (!anio || !mes || !dia) return 'N/A';
    return new Date(anio, mes - 1, dia).toLocaleDateString('es-VE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function PurgeAuditLogsModal({
    isOpen,
    clases,
    onClose,
    onPurgeComplete,
}: PurgeAuditLogsModalProps) {
    const { toast } = useToast();
    const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
    const [simulacion, setSimulacion] = useState<ResultadoPurga[]>([]);
    const [simulando, setSimulando] = useState(false);
    const [purgando, setPurgando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Solo se ofrecen las clases que ya tienen registros vencidos.
    const disponibles = useMemo(
        () => clases.filter((c) => c.eventos_purgables > 0),
        [clases]
    );

    useEffect(() => {
        if (isOpen) {
            setSeleccionadas(new Set(disponibles.map((c) => c.clase)));
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, clases]);

    // La vista previa la calcula la base con la MISMA función que borra, así que
    // lo que se muestra aquí es exactamente lo que va a pasar.
    useEffect(() => {
        if (!isOpen) return;
        if (seleccionadas.size === 0) {
            setSimulacion([]);
            return;
        }
        let cancelado = false;
        setSimulando(true);
        simularPurgaAuditoriaAction(Array.from(seleccionadas))
            .then((result) => {
                if (cancelado) return;
                if (result.success && result.data) {
                    setSimulacion(result.data);
                    setError(null);
                } else {
                    setError(result.error?.message || 'Error al calcular la depuración');
                }
            })
            .finally(() => {
                if (!cancelado) setSimulando(false);
            });
        return () => {
            cancelado = true;
        };
    }, [isOpen, seleccionadas]);

    const porClase = useMemo(() => {
        const mapa = new Map<string, ResultadoPurga>();
        simulacion.forEach((r) => mapa.set(r.clase, r));
        return mapa;
    }, [simulacion]);

    const totalABorrar = useMemo(
        () => simulacion.reduce((suma, r) => suma + r.eventos_borrados, 0),
        [simulacion]
    );
    const totalRetenido = useMemo(
        () => simulacion.reduce((suma, r) => suma + r.eventos_retenidos, 0),
        [simulacion]
    );

    const alternar = (clase: string) => {
        const nuevo = new Set(seleccionadas);
        if (nuevo.has(clase)) nuevo.delete(clase);
        else nuevo.add(clase);
        setSeleccionadas(nuevo);
    };

    const alternarTodas = () => {
        if (seleccionadas.size === disponibles.length) setSeleccionadas(new Set());
        else setSeleccionadas(new Set(disponibles.map((c) => c.clase)));
    };

    const handlePurgar = async () => {
        if (seleccionadas.size === 0) {
            toast.warning('Selecciona al menos un tipo de registro', 'Selección requerida');
            return;
        }

        setPurgando(true);
        try {
            const result = await purgarAuditoriaAction(Array.from(seleccionadas));
            if (result.success && result.data) {
                const { total, retenidos } = result.data;
                toast.success(
                    total === 0
                        ? 'No hubo registros que depurar.'
                        : `Se depuraron ${total} registro(s) de auditoría.` +
                              (retenidos > 0 ? ` ${retenidos} se conservaron por agrupación.` : ''),
                    'Auditoría depurada'
                );
                onPurgeComplete?.();
                onClose();
            } else {
                toast.error(result.error?.message || 'Error al depurar la auditoría', 'Error');
            }
        } catch {
            toast.error('Error al depurar la auditoría', 'Error inesperado');
        } finally {
            setPurgando(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Depurar Registros de Auditoría"
            size="custom"
            className="w-[95vw] sm:w-[90vw] lg:w-[85vw] max-w-4xl"
        >
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Advertencia */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex items-start gap-3 transition-colors">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-300">
                            Esta acción no se puede deshacer
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400/90 mt-1">
                            Solo se borran los registros que ya superaron el plazo de conservación de su
                            tipo. Nada más reciente se toca, y la depuración queda registrada en la propia
                            auditoría con quién la hizo y cuánto borró.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Nada que depurar */}
                {disponibles.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h4 className="text-lg font-medium text-[var(--foreground)]">¡Todo al día!</h4>
                        <p className="text-[var(--card-text-muted)] mt-2">
                            No hay registros de auditoría que hayan cumplido su plazo.
                        </p>
                    </div>
                )}

                {disponibles.length > 0 && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={seleccionadas.size === disponibles.length}
                                    onChange={alternarTodas}
                                    className="w-4 h-4 text-primary border-[var(--ui-border)] bg-[var(--background)] rounded focus:ring-primary transition-colors"
                                />
                                <span className="text-sm font-medium text-[var(--foreground)]">
                                    Seleccionar todos ({disponibles.length} tipos)
                                </span>
                            </label>
                            <span className="text-sm text-[var(--card-text-muted)]">
                                {seleccionadas.size} seleccionado(s)
                            </span>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {disponibles.map((clase, index) => {
                                    const resultado = porClase.get(clase.clase);
                                    const elegida = seleccionadas.has(clase.clase);
                                    return (
                                        <motion.div
                                            key={clase.clase}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={`
                                                border rounded-lg p-4 cursor-pointer transition-all
                                                ${elegida
                                                    ? 'border-primary bg-primary-light/20 dark:bg-primary/20'
                                                    : 'border-[var(--card-border)] hover:border-[var(--ui-border)] bg-[var(--card-bg)]'
                                                }
                                            `}
                                            onClick={() => alternar(clase.clase)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={elegida}
                                                    onChange={() => alternar(clase.clase)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <Archive className="w-4 h-4 text-primary" />
                                                        <span className="font-semibold text-[var(--foreground)]">
                                                            {clase.etiqueta}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                            {clase.eventos_purgables} vencido(s)
                                                        </span>
                                                        {elegida && resultado && resultado.eventos_retenidos > 0 && (
                                                            <span
                                                                className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                                title="Comparten fecha con registros que no se purgan; el panel los muestra fusionados en una sola tarjeta, así que se conservan juntos."
                                                            >
                                                                {resultado.eventos_retenidos} se conservan
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-[var(--card-text-muted)] mb-2">
                                                        {clase.descripcion}
                                                    </p>
                                                    <div className="flex flex-wrap gap-4 text-xs text-[var(--card-text-muted)] opacity-80">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>
                                                                Se depura lo anterior a{' '}
                                                                {formatearFecha(clase.fecha_corte)}
                                                            </span>
                                                        </div>
                                                        {elegida && resultado && (
                                                            <div className="flex items-center gap-1">
                                                                <Trash2 className="w-3 h-3" />
                                                                <span>
                                                                    Se borrarán {resultado.eventos_borrados} (
                                                                    {formatearFecha(resultado.evento_mas_viejo)} –{' '}
                                                                    {formatearFecha(resultado.evento_mas_nuevo)})
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {totalRetenido > 0 && (
                            <p className="text-xs text-[var(--card-text-muted)] leading-relaxed">
                                {totalRetenido} registro(s) vencido(s) se conservarán: comparten fecha y hora
                                con otros que no se depuran y el panel los muestra fusionados en una sola
                                tarjeta, así que borrarlos dejaría tarjetas incompletas. Se irán cuando
                                venza también el plazo de sus acompañantes.
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            {disponibles.length > 0 && (
                <div className="border-t border-[var(--card-border)] p-4 flex justify-end gap-3 transition-colors">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-[var(--card-text-muted)] bg-[var(--ui-bg-inactive)] dark:bg-[var(--sidebar-hover)] rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors cursor-pointer"
                        disabled={purgando}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handlePurgar}
                        disabled={seleccionadas.size === 0 || purgando || simulando || totalABorrar === 0}
                        className={`
                            px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                            ${seleccionadas.size === 0 || purgando || simulando || totalABorrar === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-danger text-white hover:bg-danger-dark cursor-pointer'
                            }
                        `}
                    >
                        {purgando ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Depurando...
                            </>
                        ) : simulando ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Calculando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Depurar {totalABorrar} registro(s)
                            </>
                        )}
                    </button>
                </div>
            )}
        </Modal>
    );
}
