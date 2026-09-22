'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

import Table from '@/components/Table/Table';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import CatalogFormModal from '@/components/catalogs/CatalogFormModal';
import PurgeAuditLogsModal from './PurgeAuditLogsModal';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import {
    getMantenimientoAuditoriaAction,
    updateRetencionAuditoriaAction,
} from '@/app/actions/audit-retencion.actions';
import type { ClaseRetencion, UltimaPurga } from '@/lib/db/queries/auditoria-retencion.queries';
import { sanitizeUserMessage } from '@/lib/utils/error-messages';
import { logger } from '@/lib/utils/logger';

const COLUMNAS = ['Tipo de registro', 'Se conserva', 'Se depura lo anterior a', 'Registros', 'Por depurar'];
const CLAVES = ['etiqueta_txt', 'plazo_txt', 'corte_txt', 'totales_txt', 'purgables_txt'];

interface AuditMaintenanceViewProps {
    /** La notificación abre la pestaña con el modal de depuración ya desplegado. */
    abrirPurga?: boolean;
    onPurgaCerrada?: () => void;
}

function formatearFecha(fecha: string | null): string {
    if (!fecha) return '—';
    // fecha viene como YYYY-MM-DD desde SQL; se parte a mano para no pasar por
    // new Date('YYYY-MM-DD'), que lo interpreta en UTC y de noche corre el día.
    const [anio, mes, dia] = fecha.split('-').map(Number);
    if (!anio || !mes || !dia) return '—';
    return new Date(anio, mes - 1, dia).toLocaleDateString('es-VE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatearPlazo(meses: number): string {
    if (meses % 12 === 0) {
        const anios = meses / 12;
        return anios === 1 ? '1 año' : `${anios} años`;
    }
    return meses === 1 ? '1 mes' : `${meses} meses`;
}

export default function AuditMaintenanceView({ abrirPurga = false, onPurgaCerrada }: AuditMaintenanceViewProps) {
    const { toast } = useToast();
    const [clases, setClases] = useState<ClaseRetencion[]>([]);
    const [ultimaPurga, setUltimaPurga] = useState<UltimaPurga | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editando, setEditando] = useState<ClaseRetencion | null>(null);
    const [showPurgeModal, setShowPurgeModal] = useState(false);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resultado = await getMantenimientoAuditoriaAction();
            if (resultado.success && resultado.data) {
                setClases(resultado.data.clases);
                setUltimaPurga(resultado.data.ultimaPurga);
            } else {
                setError(resultado.error?.message || 'Error al cargar la política de retención');
            }
        } catch (err) {
            setError(sanitizeUserMessage(err, 'Error al cargar la política de retención'));
            logger.error('Error cargando la retención de auditoría', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    // Se espera a tener las clases cargadas: si el modal se abriera antes,
    // enseñaría un "todo al día" falso mientras llega la consulta.
    useEffect(() => {
        if (abrirPurga && !loading) setShowPurgeModal(true);
    }, [abrirPurga, loading]);

    const filas = useMemo(
        () =>
            clases.map((c) => ({
                ...c,
                etiqueta_txt: c.etiqueta,
                plazo_txt: formatearPlazo(c.meses_retencion),
                corte_txt: formatearFecha(c.fecha_corte),
                totales_txt: String(c.eventos_totales),
                purgables_txt: c.eventos_purgables > 0 ? String(c.eventos_purgables) : '—',
            })),
        [clases]
    );

    const totalPurgable = useMemo(
        () => clases.reduce((suma, c) => suma + c.eventos_purgables, 0),
        [clases]
    );

    const handleGuardarPlazo = async (data: Record<string, string>) => {
        if (!editando) return;
        const meses = Number(data.meses_retencion);
        const result = await updateRetencionAuditoriaAction(editando.clase, meses);
        if (result.success && result.data) {
            setClases(result.data);
            toast.success(
                `"${editando.etiqueta}" ahora se conserva ${formatearPlazo(meses)}.`,
                'Plazo actualizado'
            );
            setEditando(null);
        } else {
            toast.error(result.error?.message || 'Error al actualizar el plazo', 'Error');
        }
    };

    if (error) {
        return (
            <div className="px-3">
                <div className="bg-[var(--card-bg)] border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-start gap-3 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 transition-colors">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[var(--card-text)] transition-colors">
                            No se pudo cargar el mantenimiento
                        </h4>
                        <p className="text-sm text-[var(--card-text-muted)] mt-1 transition-colors">{error}</p>
                        <button
                            type="button"
                            onClick={cargar}
                            className="mt-3 h-10 px-4 inline-flex items-center justify-center gap-2 bg-[var(--card-bg)] text-[var(--card-text)] border border-[var(--ui-border)] rounded-full hover:bg-[var(--sidebar-hover)] transition-colors font-medium whitespace-nowrap cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4 text-[var(--card-text-muted)]" />
                            <span className="text-sm sm:text-base">Reintentar</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-3">
            {/* Los totales por clase ya están en la tabla y el pendiente en el
                botón, así que aquí solo va lo que no se ve en ningún otro lado. */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="text-base text-[var(--card-text-muted)]">
                    {!loading && ultimaPurga && (
                        <>
                            Última depuración: {formatearFecha(ultimaPurga.fecha.slice(0, 10))} por{' '}
                            {ultimaPurga.usuario_nombre} ({ultimaPurga.eventos_borrados})
                        </>
                    )}
                </div>

                {/* Mismo botón de acción destructiva que usa Usuarios
                    (Deshabilitar / Cerrar Semestre): píldora, no rectángulo. */}
                <button
                    type="button"
                    onClick={() => setShowPurgeModal(true)}
                    disabled={loading || totalPurgable === 0}
                    className="h-10 px-4 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors font-medium whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-50 dark:disabled:hover:bg-red-500/10"
                >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-sm sm:text-base">
                        Depurar registros vencidos{totalPurgable > 0 ? ` (${totalPurgable})` : ''}
                    </span>
                </button>
            </div>

            {loading ? (
                <TableSkeleton columns={COLUMNAS.length} rows={5} />
            ) : (
                <Table
                    data={filas as unknown as Record<string, unknown>[]}
                    columns={COLUMNAS}
                    keys={CLAVES}
                    idKey="clase"
                    rowsPerPage={10}
                    onEdit={(fila) => setEditando(fila as unknown as ClaseRetencion)}
                />
            )}

            {/* Editar el plazo: el mismo modal de formulario de los catálogos */}
            <CatalogFormModal
                key={editando?.clase ?? 'sin-edicion'}
                isOpen={editando !== null}
                onClose={() => setEditando(null)}
                onSubmit={handleGuardarPlazo}
                title={`Plazo de "${editando?.etiqueta ?? ''}"`}
                fields={[
                    {
                        name: 'meses_retencion',
                        label: `Meses que se conserva (mínimo ${editando?.meses_minimo ?? 1})`,
                        type: 'number',
                        required: true,
                        defaultValue: editando ? String(editando.meses_retencion) : undefined,
                        validate: (value) => {
                            const meses = Number(value);
                            if (!Number.isInteger(meses)) return 'Escribe un número entero de meses';
                            if (editando && meses < editando.meses_minimo) {
                                return `No puede ser menos de ${formatearPlazo(editando.meses_minimo)}`;
                            }
                            if (meses > 600) return 'El máximo son 600 meses';
                            return undefined;
                        },
                    },
                ]}
            />

            <PurgeAuditLogsModal
                isOpen={showPurgeModal}
                clases={clases}
                onClose={() => {
                    setShowPurgeModal(false);
                    onPurgaCerrada?.();
                }}
                onPurgeComplete={cargar}
            />
        </div>
    );
}
