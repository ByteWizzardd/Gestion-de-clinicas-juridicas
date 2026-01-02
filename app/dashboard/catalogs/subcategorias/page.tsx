'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import { getSubcategorias, createSubcategoria, updateSubcategoria, toggleSubcategoriaHabilitado, deleteSubcategoria } from "@/app/actions/catalogos/subcategorias.actions";
import { getMaterias } from "@/app/actions/catalogos/materias.actions";
import { getCategorias } from "@/app/actions/catalogos/categorias.actions";

export default function SubcategoriasPage() {
    const [subcategorias, setSubcategorias] = useState<any[]>([]);
    const [materias, setMaterias] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [filteredCategorias, setFilteredCategorias] = useState<any[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [selectedMateria, setSelectedMateria] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [subResult, matResult, catResult] = await Promise.all([
            getSubcategorias(), getMaterias(), getCategorias()
        ]);
        if (subResult.success && subResult.data) setSubcategorias(subResult.data);
        if (matResult.success && matResult.data) setMaterias(matResult.data);
        if (catResult.success && catResult.data) setCategorias(catResult.data);
    };

    const handleMateriaChange = (materiaId: string) => {
        setSelectedMateria(materiaId);
        const filtered = categorias.filter(c => c.id_materia.toString() === materiaId);
        setFilteredCategorias(filtered);
    };

    const handleAdd = async (data: Record<string, string>) => {
        // Parse the composite key "id_materia|num_categoria"
        const [id_materia, num_categoria] = data.id_categoria.split('|');
        const result = await createSubcategoria({
            id_materia,
            num_categoria,
            nombre_subcategoria: data.nombre_subcategoria
        });
        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            alert(result.error || 'Error al añadir subcategoría');
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsEditMode(true);
        // Pre-filter categories based on item's materia
        handleMateriaChange(item.id_materia.toString());
        setIsModalOpen(true);
    };

    const handleUpdate = async (data: Record<string, string>) => {
        if (!editingItem) return;
        const result = await updateSubcategoria(
            editingItem.id_materia,
            editingItem.num_categoria,
            editingItem.num_subcategoria,
            { nombre_subcategoria: data.nombre_subcategoria }
        );
        if (result.success) {
            handleCloseModal();
            await loadData();
        } else {
            alert(result.error || 'Error al actualizar subcategoría');
        }
    };

    const handleToggle = async (item: any) => {
        const result = await toggleSubcategoriaHabilitado(item.id_materia, item.num_categoria, item.num_subcategoria);
        if (result.success) await loadData();
        else alert(result.error);
    };

    const handleDelete = async (item: any) => {
        if (!confirm(`¿Eliminar "${item.nombre_subcategoria}"?`)) return;
        const result = await deleteSubcategoria(item.id_materia, item.num_categoria, item.num_subcategoria);
        if (result.success) await loadData();
        else alert(result.error === 'HAS_ASSOCIATIONS' ? result.message : result.error);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingItem(null);
        setSelectedMateria('');
        setFilteredCategorias([]);
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Subcategorías</h1>
            <p className="mb-6 ml-3">Subcategorías dentro de cada categoría</p>
            <CatalogDetailClient
                data={subcategorias}
                columns={["ID Materia", "ID Categoría", "ID Subcategoría", "Subcategoría", "Categoría", "Materia", "Habilitado"]}
                addLabel="Añadir Subcategoría"
                onAddClick={() => setIsModalOpen(true)}
                filterField="id_materia"
                autoGenerateFilter={true}
                renderActions={(item: any) => (
                    <CatalogActionsMenu
                        item={item}
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
                title={isEditMode ? "Editar Subcategoría" : "Añadir Subcategoría"}
                onFieldChange={(fieldName, value) => {
                    if (fieldName === 'id_materia_temp') {
                        handleMateriaChange(value);
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
                        name: 'id_categoria',
                        label: 'Categoría',
                        type: 'select',
                        options: filteredCategorias.map(c => ({ value: `${c.id_materia}|${c.num_categoria}`, label: c.nombre_categoria })),
                        required: !isEditMode,
                        defaultValue: isEditMode ? `${editingItem?.id_materia}|${editingItem?.num_categoria}` : undefined
                    },
                    {
                        name: 'nombre_subcategoria',
                        label: 'Nombre de la Subcategoría',
                        required: true,
                        defaultValue: isEditMode ? editingItem?.nombre_subcategoria : undefined
                    }
                ]}
            />
        </>
    );
}
