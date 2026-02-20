'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2 } from "lucide-react";
import { getNucleos, createNucleo, updateNucleo, toggleNucleoHabilitado, deleteNucleo } from "@/app/actions/catalogos/nucleos.actions";
import { getParroquias } from "@/app/actions/catalogos/parroquias.actions";
import { getEstados } from "@/app/actions/catalogos/estados.actions";
import { getMunicipios } from "@/app/actions/catalogos/municipios.actions";
import { useToast } from "@/components/ui/feedback/ToastProvider";

export default function NucleosPage() {
    const [nucleos, setNucleos] = useState<any[]>([]);

    // Catalogos completos para selects
    const [estados, setEstados] = useState<any[]>([]);
    const [municipios, setMunicipios] = useState<any[]>([]);
    const [parroquias, setParroquias] = useState<any[]>([]);

    // Variables filtradas para dropdowns en cascada
    const [filteredMunicipios, setFilteredMunicipios] = useState<any[]>([]);
    const [filteredParroquias, setFilteredParroquias] = useState<any[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewItem, setViewItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const [nucleosResult, parroquiasResult, estadosResult, municipiosResult] = await Promise.all([
            getNucleos(), getParroquias(), getEstados(), getMunicipios()
        ]);
        if (nucleosResult.success && nucleosResult.data) setNucleos(nucleosResult.data);
        if (parroquiasResult.success && parroquiasResult.data) setParroquias(parroquiasResult.data);
        if (estadosResult.success && estadosResult.data) setEstados(estadosResult.data);
        if (municipiosResult.success && municipiosResult.data) setMunicipios(municipiosResult.data);
        setLoading(false);
    };

    const handleFieldChange = (fieldName: string, value: string) => {
        if (fieldName === 'id_estado') {
            const filteredMuns = municipios.filter(m => m.id_estado.toString() === value);
            setFilteredMunicipios(filteredMuns);
            setFilteredParroquias([]); // Reset parroquias when state changes
        } else if (fieldName === 'id_municipio') {
            // Find the selected municipio to ensure we use correct composite key filtering if needed, 
            // but for parroquias filtering we typically need id_estado AND id_municipio.
            // However, the 'value' passed is just the num_municipio (or id).
            // Since filtering parroquias requires matching both, but 'filteredMunicipios' implies we already selected a state...
            // Actually, querying parroquias purely by num_municipio is risky if nums are reused across states.
            // But here we rely on the fact that we are in a modal session where a state IS selected (or we hope so).
            // A better way is: we can't easily know the selected state here without access to full formData.
            // BUT: Since filteredMunicipios is *already* filtered by the selected state, any municipio chosen FROM it belongs to that state.
            // So we need to find the id_estado of the chosen municipio.
            const mun = filteredMunicipios.find(m => (m.num_municipio || m.id_municipio).toString() === value);
            if (mun) {
                const filteredParrs = parroquias.filter(p =>
                    p.id_estado === mun.id_estado &&
                    (p.num_municipio || p.id_municipio) === (mun.num_municipio || mun.id_municipio)
                );
                setFilteredParroquias(filteredParrs);
            } else {
                setFilteredParroquias([]);
            }
        }
    };

    const handleAdd = async (data: Record<string, string>) => {
        const result = await createNucleo(data as { id_estado: string; id_municipio: string; id_parroquia: string; nombre_nucleo: string });
        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            toast.error(result.error || 'Error al añadir núcleo');
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsEditMode(true);
        // Pre-filter
        const fMunicipios = municipios.filter(m => m.id_estado === item.id_estado);
        setFilteredMunicipios(fMunicipios);
        const fParroquias = parroquias.filter(p => p.id_estado === item.id_estado && (p.num_municipio || p.id_municipio) === item.num_municipio);
        setFilteredParroquias(fParroquias);
        setIsModalOpen(true);
    };

    const handleView = (item: any) => {
        setViewItem(item);
        setIsViewModalOpen(true);
    };

    const handleUpdate = async (data: Record<string, string>) => {
        if (!editingItem) return;
        const result = await updateNucleo(
            editingItem.id_nucleo,
            {
                nombre_nucleo: data.nombre_nucleo,
                id_estado: data.id_estado,
                id_municipio: data.id_municipio,
                id_parroquia: data.id_parroquia
            }
        );
        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            toast.error(result.error || 'Error al actualizar núcleo');
        }
    };

    const handleToggle = async (item: any) => {
        const result = await toggleNucleoHabilitado(item.id_nucleo);
        if (result.success) await loadData();
        else toast.error(result.error || 'Error al cambiar estado');
    };

    const handleDelete = async (item: any, motivo?: string) => {
        const result = await deleteNucleo(item.id_nucleo, motivo);
        if (result.success) await loadData();
        else toast.error(result.error === 'HAS_ASSOCIATIONS' ? (result.message || 'No se puede eliminar') : (result.error || 'Error al eliminar'));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingItem(null);
        setFilteredMunicipios([]);
        setFilteredParroquias([]);
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Núcleos</h1>
            <p className="mb-6 ml-3">Núcleos universitarios</p>
            <CatalogDetailClient
                data={nucleos}
                columns={["Núcleo", "Estado", "Municipio", "Parroquia", "Habilitado"]}
                keys={["nombre_nucleo", "nombre_estado", "nombre_municipio", "nombre_parroquia", "habilitado"]}
                addLabel="Añadir Núcleo"
                onAddClick={() => setIsModalOpen(true)}
                loading={loading}
                renderActions={(item: any) => (
                    <CatalogActionsMenu
                        item={item}
                        titleField="nombre_nucleo"
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
                title={isEditMode ? "Editar Núcleo" : "Añadir Núcleo"}
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
                        options: filteredMunicipios.map(m => ({ value: (m.num_municipio || m.id_municipio).toString(), label: m.nombre_municipio })),
                        required: !isEditMode,
                        defaultValue: isEditMode ? (editingItem?.num_municipio || editingItem?.id_municipio)?.toString() : undefined
                    },
                    {
                        name: 'id_parroquia',
                        label: 'Parroquia',
                        type: 'select',
                        options: filteredParroquias.map(p => ({ value: (p.num_parroquia || p.id_parroquia).toString(), label: p.nombre_parroquia })),
                        required: !isEditMode,
                        defaultValue: isEditMode ? (editingItem?.num_parroquia || editingItem?.id_parroquia)?.toString() : undefined
                    },
                    {
                        name: 'nombre_nucleo',
                        label: 'Nombre del Núcleo',
                        required: true,
                        defaultValue: isEditMode ? editingItem?.nombre_nucleo : undefined
                    }
                ]}
            />
            <CatalogViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles del Núcleo"
                fields={[
                    { label: "Núcleo", value: viewItem?.nombre_nucleo, icon: FileText, fullWidth: true },
                    { label: "Parroquia", value: viewItem?.nombre_parroquia, icon: FileText },
                    { label: "Municipio", value: viewItem?.nombre_municipio, icon: FileText },
                    { label: "Estado", value: viewItem?.nombre_estado, icon: FileText },
                    { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
                ]}
            />
        </>
    );
}