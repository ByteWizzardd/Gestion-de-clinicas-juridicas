'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2 } from "lucide-react";
import { getEstados, updateEstado, toggleEstadoHabilitado, deleteEstado } from "@/app/actions/catalogos/estados.actions";

export default function EstadosPage() {
    const [estados, setEstados] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewItem, setViewItem] = useState<any>(null);

    useEffect(() => {
        loadEstados();
    }, []);

    const loadEstados = async () => {
        const result = await getEstados();
        if (result.success && result.data) {
            setEstados(result.data);
        }
    };

    const handleAdd = async (data: Record<string, string>) => {
        const { createEstado } = await import('@/app/actions/catalogos/estados.actions');
        const result = await createEstado(data as { nombre_estado: string });

        if (result.success) {
            setIsModalOpen(false);
            await loadEstados();
        } else {
            alert(result.error || 'Error al añadir estado');
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
        const result = await updateEstado(editingItem.id_estado, data as { nombre_estado: string });
        if (result.success) {
            setIsModalOpen(false);
            setIsEditMode(false);
            setEditingItem(null);
            await loadEstados();
        } else {
            alert(result.error || 'Error al actualizar estado');
        }
    };

    const handleToggleHabilitado = async (item: any) => {
        const result = await toggleEstadoHabilitado(item.id_estado);
        if (result.success) {
            await loadEstados();
        } else {
            alert(result.error || 'Error al cambiar estado');
        }
    };

    const handleDelete = async (item: any, motivo?: string) => {
        const result = await deleteEstado(item.id_estado, motivo);
        if (result.success) {
            await loadEstados();
        } else {
            if (result.error === 'HAS_ASSOCIATIONS') {
                alert(result.message || 'No se puede eliminar este estado porque tiene asociaciones.');
            } else {
                alert(result.error || 'Error al eliminar estado');
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
            <h1 className="text-4xl m-3 font-semibold font-primary">Estados</h1>
            <p className="mb-6 ml-3">Estados del país registrados en el sistema</p>
            <CatalogDetailClient
                data={estados}
                columns={["ID Estado", "Estado", "Habilitado"]}
                addLabel="Añadir Estado"
                onAddClick={() => setIsModalOpen(true)}
                renderActions={(item: any) => (
                    <CatalogActionsMenu
                        item={item}
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
                title={isEditMode ? "Editar Estado" : "Añadir Estado"}
                fields={[
                    {
                        name: 'nombre_estado',
                        label: 'Nombre del Estado',
                        required: true,
                        defaultValue: isEditMode ? editingItem?.nombre_estado : undefined
                    }
                ]}
            />
            <CatalogViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles del Estado"
                fields={[
                    { label: "ID Estado", value: viewItem?.id_estado, icon: Hash },
                    { label: "Estado", value: viewItem?.nombre_estado, icon: FileText, fullWidth: true },
                    { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
                ]}
            />
        </>
    );
}
