'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getSubcategorias, createSubcategoria } from "@/app/actions/catalogos/subcategorias.actions";
import { getMaterias } from "@/app/actions/catalogos/materias.actions";
import { getCategorias } from "@/app/actions/catalogos/categorias.actions";

export default function SubcategoriasPage() {
    const [subcategorias, setSubcategorias] = useState<any[]>([]);
    const [materias, setMaterias] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [filteredCategorias, setFilteredCategorias] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMateria, setSelectedMateria] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [subResult, matResult, catResult] = await Promise.all([
            getSubcategorias(),
            getMaterias(),
            getCategorias()
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
            setIsModalOpen(false);
            setSelectedMateria('');
            setFilteredCategorias([]);
            await loadData();
        } else {
            alert(result.error || 'Error al añadir subcategoría');
        }
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Subcategorías</h1>
            <p className="mb-6 ml-3">Subcategorías dentro de cada categoría</p>
            <CatalogDetailClient
                data={subcategorias}
                columns={["ID Materia", "Num Cat", "Num Sub", "Nombre", "Materia", "Categoría"]}
                addLabel="Añadir Subcategoría"
                onAddClick={() => setIsModalOpen(true)}
                filterField="id_materia"
                autoGenerateFilter={true}
            />
            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMateria('');
                    setFilteredCategorias([]);
                }}
                onSubmit={handleAdd}
                title="Añadir Subcategoría"
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
                        required: true
                    },
                    {
                        name: 'id_categoria',
                        label: 'Categoría',
                        type: 'select',
                        options: filteredCategorias.map(c => ({ value: `${c.id_materia}|${c.num_categoria}`, label: c.nombre_categoria })),
                        required: true
                    },
                    { name: 'nombre_subcategoria', label: 'Nombre de la Subcategoría', required: true }
                ]}
            />
        </>
    );
}
