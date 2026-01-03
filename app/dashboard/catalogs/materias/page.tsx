'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2 } from "lucide-react";
import { getMaterias, updateMateria, toggleMateriaHabilitado, deleteMateria } from "@/app/actions/catalogos/materias.actions";

export default function MateriasPage() {
    const [materias, setMaterias] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewItem, setViewItem] = useState<any>(null);

    useEffect(() => {
        loadMaterias();
    }, []);

    const loadMaterias = async () => {
        const result = await getMaterias();
        if (result.success && result.data) {
            setMaterias(result.data);
        }
    };

    const handleAdd = async (data: Record<string, string>) => {
        const { createMateria } = await import('@/app/actions/catalogos/materias.actions');
        const result = await createMateria(data as { nombre_materia: string });

        if (result.success) {
            console.log('✅ Materia añadida, recargando lista...');
            setIsModalOpen(false);
            await loadMaterias();
        } else {
            console.error('Error al añadir materia:', result.error);
            alert(result.error || 'Error al añadir materia');
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

        const result = await updateMateria(editingItem.id_materia, data as { nombre_materia: string });

        if (result.success) {
            setIsModalOpen(false);
            setIsEditMode(false);
            setEditingItem(null);
            await loadMaterias();
        } else {
            alert(result.error || 'Error al actualizar materia');
        }
    };

    const handleToggleHabilitado = async (item: any) => {
        const result = await toggleMateriaHabilitado(item.id_materia);

        if (result.success) {
            await loadMaterias();
        } else {
            alert(result.error || 'Error al cambiar estado');
        }
    };

    const handleDelete = async (item: any) => {
        const confirmMessage = `¿Estás seguro de que deseas eliminar la materia "${item.nombre_materia}"?`;

        if (!confirm(confirmMessage)) {
            return;
        }

        const result = await deleteMateria(item.id_materia);

        if (result.success) {
            await loadMaterias();
        } else {
            if (result.error === 'HAS_ASSOCIATIONS') {
                alert(result.message || 'No se puede eliminar esta materia porque tiene asociaciones. Deshabilítela en su lugar.');
            } else {
                alert(result.error || 'Error al eliminar materia');
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
            <h1 className="text-4xl m-3 font-semibold font-primary">Materias</h1>
            <p className="mb-6 ml-3">Áreas principales del derecho que se manejan en el sistema</p>

            <CatalogDetailClient
                data={materias}
                columns={["ID Materia", "Materia", "Habilitado"]}
                addLabel="Añadir Materia"
                onAddClick={() => setIsModalOpen(true)}
                renderActions={(item: any) => (
                    <CatalogActionsMenu
                        item={item}
                        onView={() => handleView(item)}
                        onEdit={() => handleEdit(item)}
                        onToggleHabilitado={() => handleToggleHabilitado(item)}
                        onDelete={() => handleDelete(item)}
                    />
                )}
            />

            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={isEditMode ? handleUpdate : handleAdd}
                title={isEditMode ? "Editar Materia" : "Añadir Materia"}
                fields={[
                    {
                        name: 'nombre_materia',
                        label: 'Nombre de la Materia',
                        required: true,
                        defaultValue: isEditMode ? editingItem?.nombre_materia : undefined
                    }
                ]}
            />

            <CatalogViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles de la Materia"
                fields={[
                    { label: "ID Materia", value: viewItem?.id_materia, icon: Hash },
                    { label: "Materia", value: viewItem?.nombre_materia, icon: FileText, fullWidth: true },
                    { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
                ]}
            />
        </>
    );
}
