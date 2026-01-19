'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2 } from "lucide-react";
import { getNivelesEducativos, updateNivelEducativo, toggleNivelEducativoHabilitado, deleteNivelEducativo } from "@/app/actions/catalogos/niveles-educativos.actions";
import { useToast } from "@/components/ui/feedback/ToastProvider";

export default function NivelesEducativosPage() {
    const [nivelesEducativos, setNivelesEducativos] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewItem, setViewItem] = useState<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadNivelesEducativos();
    }, []);

    const loadNivelesEducativos = async () => {
        const result = await getNivelesEducativos();
        if (result.success && result.data) {
            setNivelesEducativos(result.data);
        }
    };

    const handleAdd = async (data: Record<string, string>) => {
        const { createNivelEducativo } = await import('@/app/actions/catalogos/niveles-educativos.actions');
        const result = await createNivelEducativo(data as { descripcion: string });

        if (result.success) {
            setIsModalOpen(false);
            await loadNivelesEducativos();
        } else {
            toast.error(result.error || 'Error al añadir nivel educativo');
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleView = (item: any) => {
        setViewItem(item);
        setIsViewModalOpen(true);
    };

    const handleUpdate = async (data: Record<string, string>) => {
        if (!editingItem) return;
        const result = await updateNivelEducativo(editingItem.id_nivel_educativo, data as { descripcion: string });
        if (result.success) {
            setIsModalOpen(false);
            setIsEditMode(false);
            setEditingItem(null);
            await loadNivelesEducativos();
        } else {
            toast.error(result.error || 'Error al actualizar nivel educativo');
        }
    };

    const handleToggleHabilitado = async (item: any) => {
        const result = await toggleNivelEducativoHabilitado(item.id_nivel_educativo);
        if (result.success) {
            await loadNivelesEducativos();
        } else {
            toast.error(result.error || 'Error al cambiar estado');
        }
    };

    const handleDelete = async (item: any, motivo?: string) => {
        const result = await deleteNivelEducativo(item.id_nivel_educativo, motivo);
        if (result.success) {
            await loadNivelesEducativos();
        } else {
            if (result.error === 'HAS_ASSOCIATIONS') {
                toast.error(result.message || 'No se puede eliminar este nivel educativo porque tiene asociaciones.');
            } else {
                toast.error(result.error || 'Error al eliminar nivel educativo');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingItem(null);
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Niveles Educativos</h1>
            <p className="mb-6 ml-3">Niveles educativos registrados en el sistema</p>
            <CatalogDetailClient
                data={nivelesEducativos}
                columns={["ID Nivel", "Descripción", "Habilitado"]}
                addLabel="Añadir Nivel Educativo"
                onAddClick={() => setIsModalOpen(true)}
                renderActions={(item: any) => (
                    <CatalogActionsMenu
                        item={item}
                        titleField="descripcion"
                        onView={() => handleView(item)}
                        onEdit={() => handleEdit(item)}
                        onToggleHabilitado={() => handleToggleHabilitado(item)}
                        onDelete={(motivo) => handleDelete(item, motivo)}
                    />
                )}
            />
            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={isEditMode ? handleUpdate : handleAdd}
                title={isEditMode ? "Editar Nivel Educativo" : "Añadir Nivel Educativo"}
                fields={[
                    {
                        name: 'descripcion',
                        label: 'Descripción',
                        required: true,
                        defaultValue: isEditMode ? editingItem?.descripcion : undefined
                    }
                ]}
            />
            <CatalogViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles del Nivel Educativo"
                fields={[
                    { label: "ID Nivel", value: viewItem?.id_nivel_educativo, icon: Hash },
                    { label: "Descripción", value: viewItem?.descripcion, icon: FileText, fullWidth: true },
                    { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
                ]}
            />
        </>
    );
}
