'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getAmbitosLegales, createAmbitoLegal } from "@/app/actions/catalogos/ambitos-legales.actions";
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [ambitosResult, materiasResult, categoriasResult, subcategoriasResult] = await Promise.all([
            getAmbitosLegales(),
            getMaterias(),
            getCategorias(),
            getSubcategorias()
        ]);

        if (ambitosResult.success && ambitosResult.data) setAmbitos(ambitosResult.data);
        if (materiasResult.success && materiasResult.data) setMaterias(materiasResult.data);
        if (categoriasResult.success && categoriasResult.data) setCategorias(categoriasResult.data);
        if (subcategoriasResult.success && subcategoriasResult.data) setSubcategorias(subcategoriasResult.data);
    };

    const handleMateriaChange = (materiaId: string) => {
        // Filter categories based on selected materia
        const filtered = categorias.filter(c => c.id_materia.toString() === materiaId);
        setFilteredCategorias(filtered);
        setFilteredSubcategorias([]);
    };

    const handleCategoriaChange = (categoriaValue: string) => {
        // categoriaValue is "id_materia|num_categoria"
        const [idMateria, numCategoria] = categoriaValue.split('|');

        // Filter subcategories based on composite key match
        const filtered = subcategorias.filter(s =>
            s.id_materia.toString() === idMateria &&
            s.num_categoria.toString() === numCategoria
        );
        setFilteredSubcategorias(filtered);
    };

    const handleAdd = async (data: Record<string, string>) => {
        // Data contains composite keys
        // id_categoria_temp: "id_materia|num_categoria"
        // id_subcategoria: "id_materia|num_categoria|num_subcategoria"

        const [id_materia, num_categoria, num_subcategoria] = data.id_subcategoria.split('|');

        const result = await createAmbitoLegal({
            id_materia,
            num_categoria,
            num_subcategoria,
            nombre_ambito_legal: data.nombre_ambito_legal
        });

        if (result.success) {
            setIsModalOpen(false);
            setFilteredCategorias([]);
            setFilteredSubcategorias([]);
            await loadData();
        } else {
            alert(result.error || 'Error al añadir ámbito legal');
        }
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Ámbitos Legales</h1>
            <p className="mb-6 ml-3">Ámbitos legales específicos dentro de cada subcategoría</p>

            <CatalogDetailClient
                data={ambitos}
                columns={["ID Materia", "Número Categoría", "Número Subcategoría", "Número Ámbito", "Nombre Ámbito", "Materia", "Categoría", "Subcategoría"]}
                addLabel="Añadir Ámbito Legal"
                onAddClick={() => setIsModalOpen(true)}
                filterField="nombre_materia"
                autoGenerateFilter={true}
            />

            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFilteredCategorias([]);
                    setFilteredSubcategorias([]);
                }}
                onSubmit={handleAdd}
                // Add field change handler for cascaded filtering
                onFieldChange={(name, value) => {
                    if (name === 'id_materia_temp') {
                        handleMateriaChange(value);
                    } else if (name === 'id_categoria_temp') {
                        handleCategoriaChange(value);
                    }
                }}
                title="Añadir Ámbito Legal"
                fields={[
                    {
                        name: 'id_materia_temp',
                        label: 'Materia',
                        type: 'select',
                        options: materias.map(m => ({ value: m.id_materia.toString(), label: m.nombre_materia })),
                        required: true
                    },
                    {
                        name: 'id_categoria_temp',
                        label: 'Categoría',
                        type: 'select',
                        options: filteredCategorias.map(c => ({
                            // Use composite key for value
                            value: `${c.id_materia}|${c.num_categoria}`,
                            label: c.nombre_categoria
                        })),
                        required: true
                    },
                    {
                        name: 'id_subcategoria',
                        label: 'Subcategoría',
                        type: 'select',
                        options: filteredSubcategorias.map(s => ({
                            // Use full composite key for value
                            value: `${s.id_materia}|${s.num_categoria}|${s.num_subcategoria}`,
                            label: s.nombre_subcategoria
                        })),
                        required: true
                    },
                    { name: 'nombre_ambito_legal', label: 'Nombre del Ámbito Legal', required: true }
                ]}
            />
        </>
    );
}
