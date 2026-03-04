'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Download, Pencil, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';
import Table from '@/components/Table/Table';
import { getCasoByIdAction, updateCasoAction, deleteCasoAction } from '@/app/actions/casos';
import { descargarHistorialCasoAction } from '@/app/actions/reports';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import { generateCasoHistorialZip } from '@/lib/utils/case-history-pdf-generator';
import type { CasoHistorialData } from '@/lib/types/report-types';
import CaseFormModal from '@/components/forms/CaseFormModal';
import { logger } from '@/lib/utils/logger';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';

interface UserCasesTabProps {
    casos: Array<{
        id_caso: number;
        fecha_solicitud: string | null;
        fecha_inicio_caso: string | null;
        fecha_fin_caso: string | null;
        tramite: string | null;
        estatus: string | null;
        cant_beneficiarios: number | null;
        observaciones: string | null;
        nombre_nucleo: string | null;
        nombre_materia: string | null;
        nombre_categoria: string | null;
        nombre_subcategoria: string | null;
    }>;
}

export default function UserCasesTab({ casos: initialCasos }: UserCasesTabProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [casos, setCasos] = useState(initialCasos);

    // Estados para modales
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingCase, setEditingCase] = useState<any>(null);
    const [casoToDelete, setCasoToDelete] = useState<any>(null);
    const [deleteMotivo, setDeleteMotivo] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCase, setIsLoadingCase] = useState(false);

    if (!casos || casos.length === 0) {
        return (
            <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-8 text-center transition-colors">
                <FileText className="w-12 h-12 text-[var(--card-text-muted)] mx-auto mb-4 transition-colors" />
                <p className="text-[var(--card-text-muted)] text-lg transition-colors">No hay casos asociados a este usuario</p>
            </div>
        );
    }

    const tableData = casos.map((caso) => ({
        id_caso: caso.id_caso,
        fecha_solicitud: caso.fecha_solicitud ? formatDate(caso.fecha_solicitud) : 'N/A',
        tramite: caso.tramite || 'N/A',
        estatus: caso.estatus || 'N/A',
        nucleo: caso.nombre_nucleo || 'N/A',
        materia: (() => {
            const materia = caso.nombre_materia || 'Sin materia';
            const categoria = caso.nombre_categoria?.trim() || '';
            const subcategoria = caso.nombre_subcategoria?.trim() || '';

            const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría' && categoria.toLowerCase() !== 'n/a';
            const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría' && subcategoria.toLowerCase() !== 'n/a';

            let text = materia;
            if (hasCategoria && hasSubcategoria) {
                text += ` - ${categoria} ${subcategoria}`;
            } else if (hasCategoria) {
                text += ` - ${categoria}`;
            } else if (hasSubcategoria) {
                text += ` - ${subcategoria}`;
            }
            return text;
        })()
    }));

    const handleView = (data: Record<string, unknown>) => {
        const idCaso = data.id_caso as number;
        if (idCaso) {
            router.push(`/dashboard/cases/${idCaso}`);
        }
    };

    const handleEdit = async (data: Record<string, unknown>) => {
        const idCaso = data.id_caso as number;
        if (!idCaso) return;

        try {
            setIsLoadingCase(true);
            const result = await getCasoByIdAction(idCaso);
            if (result.success && result.data) {
                setEditingCase(result.data);
                setIsEditModalOpen(true);
            } else {
                toast.error('No se pudieron obtener los datos del caso');
            }
        } catch (error) {
            logger.error('Error fetching case:', error);
            toast.error('Error al cargar datos del caso');
        } finally {
            setIsLoadingCase(false);
        }
    };

    const handleDelete = (data: Record<string, unknown>) => {
        const idCaso = data.id_caso as number;
        if (idCaso) {
            setCasoToDelete({
                id_caso: idCaso,
                codigo: idCaso.toString()
            });
            setIsDeleteModalOpen(true);
        }
    };

    const handleSubmitEdit = async (data: any) => {
        if (!editingCase) return;
        setIsSubmitting(true);
        try {
            const updateData = {
                id_caso: data.id_caso,
                tramite: data.tramite,
                observaciones: data.observaciones,
                fecha_fin_caso: data.fecha_fin_caso,
                id_nucleo: data.id_nucleo,
                id_materia: data.id_materia,
                num_categoria: data.num_categoria ?? 0,
                num_subcategoria: data.num_subcategoria ?? 0,
                num_ambito_legal: data.num_ambito_legal,
                fecha_solicitud: data.fecha_solicitud,
                cedula: data.cedula,
            };

            const result = await updateCasoAction(editingCase.id_caso, updateData);
            if (result.success) {
                toast.success('Caso actualizado exitosamente');
                setIsEditModalOpen(false);
                // Actualizar lista local
                setCasos(prev => prev.map(c => c.id_caso === editingCase.id_caso ? { ...c, ...updateData } : c));
                router.refresh();
            } else {
                toast.error(result.error?.message || 'Error al actualizar el caso');
            }
        } catch (err) {
            toast.error('Error al actualizar el caso');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!casoToDelete) return;
        setDeleteLoading(true);

        try {
            const result = await deleteCasoAction(casoToDelete.id_caso, deleteMotivo);
            if (result.success) {
                toast.success('Caso eliminado exitosamente');
                setCasos(prev => prev.filter(c => c.id_caso !== casoToDelete.id_caso));
                setIsDeleteModalOpen(false);
                setCasoToDelete(null);
                setDeleteMotivo('');
                router.refresh();
            } else {
                toast.error(result.error?.message || 'Error al eliminar el caso');
            }
        } catch (err) {
            toast.error('Error al eliminar el caso');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDownloadHistorial = async (data: Record<string, unknown>) => {
        const idCaso = data.id_caso as number;
        if (!idCaso) return;

        try {
            const result = await descargarHistorialCasoAction(idCaso);
            if (result.success && result.data) {
                await generateCasoHistorialZip(result.data as CasoHistorialData);
            } else {
                toast.error(`Error al descargar el historial: ${result.error || 'Error desconocido'}`);
            }
        } catch (error) {
            logger.error('Error al descargar historial:', error);
            toast.error('Ocurrió un error al descargar el historial del caso');
        }
    };

    const handleDownloadRegistro = async (data: Record<string, unknown>) => {
        const idCaso = data.id_caso as number;
        if (!idCaso) return;

        try {
            const result = await getCasoByIdAction(idCaso);
            if (result.success && result.data) {
                const { generateRegistroControlCasosPDF } = await import('@/lib/utils/case-registration-pdf-generator');
                await generateRegistroControlCasosPDF({
                    caso: result.data,
                    equipo: result.data.equipo || [],
                    beneficiarios: result.data.beneficiarios || []
                });
            } else {
                toast.error('Error al obtener los datos del caso para el reporte.');
            }
        } catch (error) {
            logger.error('Error al generar registro:', error);
            toast.error('Error al generar el documento');
        }
    };

    return (
        <div className="space-y-4">
            <Table
                data={tableData}
                columns={['Código', 'Fecha Solicitud', 'Trámite', 'Estatus', 'Núcleo', 'Materia']}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                actions={[
                    {
                        label: (
                            <div className="flex items-center gap-2">
                                <Download className="w-4 h-4 text-gray-500 group-hover:text-yellow-600 transition-colors" />
                                <span className="group-hover:text-yellow-600 transition-colors">Descargar historial</span>
                            </div>
                        ),
                        onClick: handleDownloadHistorial
                    },
                    {
                        label: (
                            <div className="flex items-center gap-2 text-wrap pr-1">
                                <Download className="w-4 h-4 text-gray-500 group-hover:text-yellow-600 transition-colors shrink-0" />
                                <span className="group-hover:text-yellow-600 transition-colors leading-tight">Descargar registro y control</span>
                            </div>
                        ),
                        onClick: handleDownloadRegistro
                    }
                ]}
                rowsPerPage={10}
            />

            <CaseFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleSubmitEdit}
                isEditing={true}
                initialData={editingCase}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteMotivo('');
                }}
                onConfirm={handleConfirmDelete}
                title="Eliminar caso permanentemente"
                message={
                    <div>
                        <p className="mb-4 text-base text-foreground">
                            ¿Estás seguro de que deseas eliminar el caso <strong>{casoToDelete?.id_caso}</strong>?
                        </p>
                        <p className="mb-6 text-red-500 font-semibold text-base dark:text-red-400">
                            Esta acción es irreversible. Se eliminarán todas las referencias asociadas.
                        </p>
                        <div className="flex flex-col gap-1">
                            <label className="text-base font-normal text-foreground mb-1">
                                Motivo de la eliminación
                            </label>
                            <textarea
                                className={`
                                    w-full p-4 rounded-lg border border-transparent bg-[var(--input-bg)]
                                    focus:outline-none focus:ring-1 focus:ring-primary
                                    text-base text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] resize-none
                                    ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                rows={4}
                                maxLength={250}
                                value={deleteMotivo}
                                onChange={e => setDeleteMotivo(e.target.value)}
                                placeholder="Describe el motivo de la eliminación..."
                                disabled={deleteLoading}
                            />
                        </div>
                    </div>
                }
                confirmLabel={deleteLoading ? 'Eliminando...' : 'Eliminar'}
                cancelLabel="Cancelar"
                disabled={deleteLoading || !deleteMotivo.trim()}
                confirmVariant="danger"
            />
        </div>
    );
}
