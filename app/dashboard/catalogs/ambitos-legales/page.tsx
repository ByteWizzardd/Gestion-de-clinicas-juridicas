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

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [ambitosResult, materiasResult, categoriasResult, subcategoriasResult] = await Promise.all([
            getAmbitosLegales(), getMaterias(), getCategorias(), getSubcategorias()
        ]);
        if (ambitosResult.success && ambitosResult.data) setAmbitos(ambitosResult.data);
        if (materiasResult.success && materiasResult.data) setMaterias(materiasResult.data);
        if (categoriasResult.success && categoriasResult.data) setCategorias(categoriasResult.data);
        if (subcategoriasResult.success && subcategoriasResult.data) setSubcategorias(subcategoriasResult.data);
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
            alert(result.error || 'Error al añadir ámbito legal');
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
        const result = await updateAmbitoLegal(
            editingItem.id_materia,
            editingItem.num_categoria,
            editingItem.num_subcategoria,
            editingItem.num_ambito_legal,
            { nombre_ambito_legal: data.nombre_ambito_legal }
        );
        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            alert(result.error || 'Error al actualizar ámbito legal');
        }
    };

    const handleToggle = async (item: any) => {
        const result = await toggleAmbitoLegalHabilitado(item.id_materia, item.num_categoria, item.num_subcategoria, item.num_ambito_legal);
        if (result.success) await loadData();
        else alert(result.error);
    };

    const handleDelete = async (item: any) => {
        if (!confirm(`¿Eliminar "${item.nombre_ambito_legal}"?`)) return;
        const result = await deleteAmbitoLegal(item.id_materia, item.num_categoria, item.num_subcategoria, item.num_ambito_legal);
        if (result.success) await loadData();
        else alert(result.error === 'HAS_ASSOCIATIONS' ? result.message : result.error);
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
            <h1 className="text-4xl m-3 font-semibold font-primary">Ámbitos Legales</h1>
            <p className="mb-6 ml-3">Ámbitos legales específicos dentro de cada subcategoría</p>
            <CatalogDetailClient
                data={ambitos}
                columns={["ID Materia", "ID Categoría", "ID Subcategoría", "ID Ámbito", "Ámbito", "Materia", "Categoría", "Subcategoría", "Habilitado"]}
                addLabel="Añadir Ámbito Legal"
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
                        onDelete={() => handleDelete(item)}
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
                    } else if (name === 'id_categoria_temp') {
                        handleCategoriaChange(value);
                    }
                }}
                fields={[
                    {
                        name: 'id_materia_temp',
                        label: 'Materia',
                        type: 'select',
                        options: materias.map(m => ({ value: m.id_materia.toString(), label: m.nombre_materia })),
                        required: !isEditMode,
                        defaultValue: isEditMode ? editingItem?.id_materia?.toString() : undefined
                    },
                    {
                        name: 'id_categoria_temp',
                        label: 'Categoría',
                        type: 'select',
                        options: filteredCategorias.map(c => ({
                            value: `${c.id_materia}|${c.num_categoria}`,
                            label: c.nombre_categoria
                        })),
                        required: !isEditMode,
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
                        required: !isEditMode,
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
                    { label: "ID Materia", value: viewItem?.id_materia, icon: Hash },
                    { label: "ID Categoría", value: viewItem?.num_categoria, icon: Hash },
                    { label: "ID Subcategoría", value: viewItem?.num_subcategoria, icon: Hash },
                    { label: "ID Ámbito", value: viewItem?.num_ambito_legal, icon: Hash },
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
