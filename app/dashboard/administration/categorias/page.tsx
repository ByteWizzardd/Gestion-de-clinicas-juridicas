'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2 } from "lucide-react";
import { getCategorias, createCategoria, updateCategoria, toggleCategoriaHabilitado, deleteCategoria } from "@/app/actions/catalogos/categorias.actions";
import { getMaterias } from "@/app/actions/catalogos/materias.actions";
import { useToast } from "@/components/ui/feedback/ToastProvider";

export default function CategoriasPage() {
    const [categorias, setCategorias] = useState<any[]>([]);
    const [materias, setMaterias] = useState<any[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewItem, setViewItem] = useState<any>(null);
    const { toast } = useToast();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [categoriasResult, materiasResult] = await Promise.all([
                getCategorias(), getMaterias()
            ]);
            if (categoriasResult.success && categoriasResult.data) setCategorias(categoriasResult.data);
            if (materiasResult.success && materiasResult.data) setMaterias(materiasResult.data);
        } catch (error) {
            console.error('Error in loadData:', error);
        }
    };

    const handleAdd = async (data: Record<string, string>) => {
        const result = await createCategoria(data as { id_materia: string; nombre_categoria: string });
        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            toast.error(result.error || 'Error al añadir categoría');
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

        const new_id_materia = data.id_materia ? data.id_materia : editingItem.id_materia;

        const result = await updateCategoria(
            editingItem.id_materia,
            editingItem.num_categoria,
            {
                nombre_categoria: data.nombre_categoria,
                new_id_materia
            }
        );
        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            toast.error(result.error || 'Error al actualizar categoría');
        }
    };

    const handleToggle = async (item: any) => {
        const result = await toggleCategoriaHabilitado(item.id_materia, item.num_categoria);
        if (result.success) await loadData();
        else toast.error(result.error || 'Error al cambiar estado');
    };

    const handleDelete = async (item: any, motivo?: string) => {
        const result = await deleteCategoria(item.id_materia, item.num_categoria, motivo);
        if (result.success) await loadData();
        else toast.error(result.error === 'HAS_IN_USE' ? (result.message || 'No se puede eliminar') : (result.error || 'Error al eliminar'));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingItem(null);
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Categorías</h1>
            <p className="mb-6 ml-3">Clasificaciones dentro de cada materia legal</p>
            <CatalogDetailClient
                data={categorias}
                columns={["ID Materia", "ID Categoría", "Categoría", "Materia", "Habilitado"]}
                addLabel="Añadir Categoría"
                onAddClick={() => setIsModalOpen(true)}
                filterField="nombre_materia"
                filterTarget="materia"
                autoGenerateFilter={true}
                renderActions={(item: any) => (
                    <CatalogActionsMenu
                        item={item}
                        onView={() => handleView(item)}
                        onEdit={() => handleEdit(item)}
                        onToggleHabilitado={() => handleToggle(item)}
                        onDelete={(motivo) => handleDelete(item, motivo)}
                    />
                )}
            />
            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={isEditMode ? handleUpdate : handleAdd}
                title={isEditMode ? "Editar Categoría" : "Añadir Categoría"}
                fields={[
                    {
                        name: 'id_materia',
                        label: 'Materia',
                        type: 'select',
                        required: !isEditMode,
                        options: materias.map(m => ({
                            value: m.id_materia.toString(),
                            label: m.nombre_materia
                        })),
                        defaultValue: isEditMode ? editingItem?.id_materia?.toString() : undefined
                    },
                    {
                        name: 'nombre_categoria',
                        label: 'Nombre de la Categoría',
                        required: true,
                        defaultValue: isEditMode ? editingItem?.nombre_categoria : undefined
                    }
                ]}
            />
            <CatalogViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles de la Categoría"
                fields={[
                    { label: "ID Materia", value: viewItem?.id_materia, icon: Hash },
                    { label: "ID Categoría", value: viewItem?.num_categoria, icon: Hash },
                    { label: "Categoría", value: viewItem?.nombre_categoria, icon: FileText, fullWidth: true },
                    { label: "Materia", value: viewItem?.nombre_materia, icon: FileText },
                    { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
                ]}
            />
        </>
    );
}
