'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2 } from "lucide-react";
import { getAmbitosLegales, createAmbitoLegal, updateAmbitoLegal, toggleAmbitoLegalHabilitado, deleteAmbitoLegal } from "@/app/actions/catalogos/ambitos-legales.actions";
import { getMaterias } from "@/app/actions/catalogos/materias.actions";
import { getCategorias } from "@/app/actions/catalogos/categorias.actions";
import { getSubcategorias } from "@/app/actions/catalogos/subcategorias.actions";
import { useToast } from "@/components/ui/feedback/ToastProvider";

export default function AmbitosLegalesPage() {
    const [ambitos, setAmbitos] = useState<any[]>([]);
    const [materias, setMaterias] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [subcategorias, setSubcategorias] = useState<any[]>([]);

    const [filteredCategorias, setFilteredCategorias] = useState<any[]>([]);
    const [filteredSubcategorias, setFilteredSubcategorias] = useState<any[]>([]);

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
        const [ambitosResult, materiasResult, categoriasResult, subcategoriasResult] = await Promise.all([
            getAmbitosLegales(), getMaterias(), getCategorias(), getSubcategorias()
        ]);
        if (ambitosResult.success && ambitosResult.data) setAmbitos(ambitosResult.data);
        if (materiasResult.success && materiasResult.data) setMaterias(materiasResult.data);
        if (categoriasResult.success && categoriasResult.data) setCategorias(categoriasResult.data);
        if (subcategoriasResult.success && subcategoriasResult.data) setSubcategorias(subcategoriasResult.data);
        setLoading(false);
    };

    const handleMateriaChange = (materiaId: string) => {
        const filtered = categorias.filter(c => c.id_materia.toString() === materiaId);
        setFilteredCategorias(filtered);
        setFilteredSubcategorias([]);
    };

    const handleCategoriaChange = (categoriaValue: string) => {
        const [idMateria, numCategoria] = categoriaValue.split('|');
        const filtered = subcategorias.filter(s =>
            s.id_materia.toString() === idMateria &&
            s.num_categoria.toString() === numCategoria
        );
        setFilteredSubcategorias(filtered);
    };

    const handleAdd = async (data: Record<string, string>) => {
        const [id_materia, num_categoria, num_subcategoria] = data.id_subcategoria.split('|');
        const result = await createAmbitoLegal({
            id_materia,
            num_categoria,
            num_subcategoria,
            nombre_ambito_legal: data.nombre_ambito_legal
        });
        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            toast.error(result.error || 'Error al añadir ámbito legal');
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsEditMode(true);
        // Pre-filter
        handleMateriaChange(item.id_materia.toString());
        handleCategoriaChange(`${item.id_materia}|${item.num_categoria}`);
        setIsModalOpen(true);
    };

    const handleView = (item: any) => {
        setViewItem(item);
        setIsViewModalOpen(true);
    };

    const handleUpdate = async (data: Record<string, string>) => {
        if (!editingItem) return;

        let new_id_materia = editingItem.id_materia;
        let new_num_categoria = editingItem.num_categoria;
        let new_num_subcategoria = editingItem.num_subcategoria;

        if (data.id_subcategoria) {
            const parts = data.id_subcategoria.split('|');
            if (parts.length === 3) {
                new_id_materia = parts[0];
                new_num_categoria = parts[1];
                new_num_subcategoria = parts[2];
            }
        }

        const result = await updateAmbitoLegal(
            editingItem.id_materia,
            editingItem.num_categoria,
            editingItem.num_subcategoria,
            editingItem.num_ambito_legal,
            {
                nombre_ambito_legal: data.nombre_ambito_legal,
                new_id_materia,
                new_num_categoria,
                new_num_subcategoria
            }
        );

        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            toast.error(result.error || 'Error al actualizar ámbito legal');
        }
    };

    const handleToggle = async (item: any) => {
        const result = await toggleAmbitoLegalHabilitado(item.id_materia, item.num_categoria, item.num_subcategoria, item.num_ambito_legal);
        if (result.success) await loadData();
        else toast.error(result.error || 'Error al cambiar estado');
    };

    const handleDelete = async (item: any, motivo?: string) => {
        const result = await deleteAmbitoLegal(item.id_materia, item.num_categoria, item.num_subcategoria, item.num_ambito_legal, motivo);
        if (result.success) await loadData();
        else toast.error(result.error === 'HAS_ASSOCIATIONS' ? (result.message || 'No se puede eliminar') : (result.error || 'Error al eliminar'));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingItem(null);
        setFilteredCategorias([]);
        setFilteredSubcategorias([]);
    };

    return (
        <>
            <CatalogDetailClient
                data={ambitos}
                columns={["Ámbito", "Materia", "Categoría", "Subcategoría", "Habilitado"]}
                keys={["nombre_ambito_legal", "nombre_materia", "nombre_categoria", "nombre_subcategoria", "habilitado"]}
                addLabel="Añadir Ámbito Legal"
                onAddClick={() => setIsModalOpen(true)}
                loading={loading}
                filterField="nombre_materia"
                filterTarget="materia"
                autoGenerateFilter={true}
                hideHeader={true}
                renderActions={(item: any) => (
                    <CatalogActionsMenu
                        item={item}
                        titleField="nombre_ambito_legal"
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
                title={isEditMode ? "Editar Ámbito Legal" : "Añadir Ámbito Legal"}
                onFieldChange={(name, value) => {
                    if (name === 'id_materia_temp') {
                        handleMateriaChange(value);
                        // Default updates
                        const updates: Record<string, string> = { id_categoria_temp: '', id_subcategoria: '' };

                        // Auto-select "Sin Categoría" if it's the only option
                        const relevantCategories = categorias.filter(c => c.id_materia.toString() === value);
                        if (relevantCategories.length === 1 && relevantCategories[0].nombre_categoria === 'Sin Categoría') {
                            const autoCat = relevantCategories[0];
                            const autoCatValue = `${autoCat.id_materia}|${autoCat.num_categoria}`;
                            updates.id_categoria_temp = autoCatValue;
                            handleCategoriaChange(autoCatValue);

                            // Auto-select "Sin Subcategoría" if it's the only option for this new category
                            const relevantSubcategories = subcategorias.filter(s =>
                                s.id_materia.toString() === autoCat.id_materia.toString() &&
                                s.num_categoria.toString() === autoCat.num_categoria.toString()
                            );

                            if (relevantSubcategories.length === 1 && relevantSubcategories[0].nombre_subcategoria === 'Sin Subcategoría') {
                                const autoSubValue = `${relevantSubcategories[0].id_materia}|${relevantSubcategories[0].num_categoria}|${relevantSubcategories[0].num_subcategoria}`;
                                updates.id_subcategoria = autoSubValue;
                            }
                        }

                        return updates;
                    } else if (name === 'id_categoria_temp') {
                        handleCategoriaChange(value);
                        const updates: Record<string, string> = { id_subcategoria: '' };

                        // Auto-select "Sin Subcategoría"
                        const [idMateria, numCategoria] = value.split('|');
                        const relevantSubcategories = subcategorias.filter(s =>
                            s.id_materia.toString() === idMateria &&
                            s.num_categoria.toString() === numCategoria
                        );

                        if (relevantSubcategories.length === 1 && relevantSubcategories[0].nombre_subcategoria === 'Sin Subcategoría') {
                            const autoSubValue = `${relevantSubcategories[0].id_materia}|${relevantSubcategories[0].num_categoria}|${relevantSubcategories[0].num_subcategoria}`;
                            updates.id_subcategoria = autoSubValue;
                        }

                        return updates;
                    }
                    return undefined;
                }}
                fields={[
                    {
                        name: 'id_materia_temp',
                        label: 'Materia',
                        type: 'select',
                        options: materias.map(m => ({ value: m.id_materia.toString(), label: m.nombre_materia })),
                        required: true,
                        defaultValue: isEditMode ? editingItem?.id_materia?.toString() : undefined
                    },
                    {
                        name: 'id_categoria_temp',
                        label: 'Categoría',
                        type: 'select',
                        options: filteredCategorias.length > 0 ? filteredCategorias.map(c => ({
                            value: `${c.id_materia}|${c.num_categoria}`,
                            label: c.nombre_categoria
                        })) : [{ value: "", label: "Cargando..." }], // Should update on re-render
                        required: true,
                        defaultValue: isEditMode ? `${editingItem?.id_materia}|${editingItem?.num_categoria}` : undefined
                    },
                    {
                        name: 'id_subcategoria',
                        label: 'Subcategoría',
                        type: 'select',
                        options: filteredSubcategorias.map(s => ({
                            value: `${s.id_materia}|${s.num_categoria}|${s.num_subcategoria}`,
                            label: s.nombre_subcategoria
                        })),
                        required: true,
                        defaultValue: isEditMode ? `${editingItem?.id_materia}|${editingItem?.num_categoria}|${editingItem?.num_subcategoria}` : undefined
                    },
                    {
                        name: 'nombre_ambito_legal',
                        label: 'Nombre del Ámbito Legal',
                        required: true,
                        defaultValue: isEditMode ? editingItem?.nombre_ambito_legal : undefined
                    }
                ]}
            />
            <CatalogViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles del Ámbito Legal"
                fields={[
                    { label: "Ámbito Legal", value: viewItem?.nombre_ambito_legal, icon: FileText, fullWidth: true },
                    { label: "Subcategoría", value: viewItem?.nombre_subcategoria, icon: FileText },
                    { label: "Categoría", value: viewItem?.nombre_categoria, icon: FileText },
                    { label: "Materia", value: viewItem?.nombre_materia, icon: FileText },
                    { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
                ]}
            />
        </>
    );
}
