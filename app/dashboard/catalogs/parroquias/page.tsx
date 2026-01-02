'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2 } from "lucide-react";
import { getParroquias, createParroquia, updateParroquia, toggleParroquiaHabilitado, deleteParroquia } from "@/app/actions/catalogos/parroquias.actions";
import { getEstados } from "@/app/actions/catalogos/estados.actions";
import { getMunicipios } from "@/app/actions/catalogos/municipios.actions";

export default function ParroquiasPage() {
    const [parroquias, setParroquias] = useState<any[]>([]);
    const [estados, setEstados] = useState<any[]>([]);
    const [municipios, setMunicipios] = useState<any[]>([]);
    const [filteredMunicipios, setFilteredMunicipios] = useState<any[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewItem, setViewItem] = useState<any>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [parroquiasResult, estadosResult, municipiosResult] = await Promise.all([
            getParroquias(), getEstados(), getMunicipios()
        ]);
        if (parroquiasResult.success && parroquiasResult.data) setParroquias(parroquiasResult.data);
        if (estadosResult.success && estadosResult.data) setEstados(estadosResult.data);
        if (municipiosResult.success && municipiosResult.data) setMunicipios(municipiosResult.data);
    };

    const handleFieldChange = (fieldName: string, value: string) => {
        if (fieldName === 'id_estado') {
            const filtered = municipios.filter(m => m.id_estado.toString() === value);
            setFilteredMunicipios(filtered);
        }
    };

    const handleAdd = async (data: Record<string, string>) => {
        const result = await createParroquia(data as { id_estado: string; id_municipio: string; nombre_parroquia: string });
        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            alert(result.error || 'Error al añadir parroquia');
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsEditMode(true);
        // Pre-filter municipios based on the item's state
        const filtered = municipios.filter(m => m.id_estado === item.id_estado);
        setFilteredMunicipios(filtered);
        setIsModalOpen(true);
    };

    const handleView = (item: any) => {
        setViewItem(item);
        setIsViewModalOpen(true);
    };

    const handleUpdate = async (data: Record<string, string>) => {
        if (!editingItem) return;
        const result = await updateParroquia(
            editingItem.id_estado,
            editingItem.num_municipio,
            editingItem.num_parroquia,
            { nombre_parroquia: data.nombre_parroquia }
        );
        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            alert(result.error || 'Error al actualizar parroquia');
        }
    };

    const handleToggle = async (item: any) => {
        const result = await toggleParroquiaHabilitado(item.id_estado, item.num_municipio, item.num_parroquia);
        if (result.success) await loadData();
        else alert(result.error);
    };

    const handleDelete = async (item: any) => {
        if (!confirm(`¿Eliminar "${item.nombre_parroquia}"?`)) return;
        const result = await deleteParroquia(item.id_estado, item.num_municipio, item.num_parroquia);
        if (result.success) await loadData();
        else alert(result.error === 'HAS_ASSOCIATIONS' ? result.message : result.error);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingItem(null);
        setFilteredMunicipios([]);
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Parroquias</h1>
            <p className="mb-6 ml-3">Parroquias de Venezuela</p>
            <CatalogDetailClient
                data={parroquias}
                columns={["ID Parroquia", "Parroquia", "ID Estado", "ID Municipio", "Estado", "Municipio", "Habilitado"]}
                addLabel="Añadir Parroquia"
                onAddClick={() => setIsModalOpen(true)}
                renderActions={(item: any) => (
                    <CatalogActionsMenu
                        item={item}
                        onView={() => handleView(item)}
                        onEdit={() => handleEdit(item)}
                        onToggleHabilitado={() => handleToggle(item)}
                        onDelete={() => handleDelete(item)}
                    />
                )}
            />
            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={isEditMode ? handleUpdate : handleAdd}
                title={isEditMode ? "Editar Parroquia" : "Añadir Parroquia"}
                onFieldChange={handleFieldChange}
                fields={[
                    {
                        name: 'id_estado',
                        label: 'Estado',
                        type: 'select',
                        options: estados.map(e => ({ value: e.id_estado.toString(), label: e.nombre_estado })),
                        required: !isEditMode,
                        defaultValue: isEditMode ? editingItem?.id_estado?.toString() : undefined
                    },
                    {
                        name: 'id_municipio',
                        label: 'Municipio',
                        type: 'select',
                        options: filteredMunicipios.map(m => ({
                            // Ensure we use num_municipio (aliased or not) - assuming data has num_municipio or id_municipio logic
                            value: (m.num_municipio || m.id_municipio).toString(),
                            label: m.nombre_municipio
                        })),
                        required: !isEditMode,
                        defaultValue: isEditMode ? (editingItem?.num_municipio || editingItem?.id_municipio)?.toString() : undefined
                    },
                    {
                        name: 'nombre_parroquia',
                        label: 'Nombre de la Parroquia',
                        required: true,
                        defaultValue: isEditMode ? editingItem?.nombre_parroquia : undefined
                    }
                ]}
            />
            <CatalogViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles de la Parroquia"
                fields={[
                    { label: "ID Estado", value: viewItem?.id_estado, icon: Hash },
                    { label: "ID Municipio", value: viewItem?.num_municipio, icon: Hash },
                    { label: "ID Parroquia", value: viewItem?.num_parroquia, icon: Hash },
                    { label: "Parroquia", value: viewItem?.nombre_parroquia, icon: FileText, fullWidth: true },
                    { label: "Municipio", value: viewItem?.nombre_municipio, icon: FileText },
                    { label: "Estado", value: viewItem?.nombre_estado, icon: FileText },
                    { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
                ]}
            />
        </>
    );
}
