'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getCategorias } from "@/app/actions/catalogos/categorias.actions";
import { getMaterias } from "@/app/actions/catalogos/materias.actions";

export default function CategoriasPage() {
    const [categorias, setCategorias] = useState<any[]>([]);
    const [materias, setMaterias] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [categoriasResult, materiasResult] = await Promise.all([
                getCategorias(),
                getMaterias()
            ]);

            if (categoriasResult.success && categoriasResult.data) {
                setCategorias(categoriasResult.data);
            }
            if (materiasResult.success && materiasResult.data) {
                setMaterias(materiasResult.data);
            }
        } catch (error) {
            console.error('Error in loadData:', error);
        }
    };

    const handleAdd = async (data: Record<string, string>) => {
        const { createCategoria } = await import('@/app/actions/catalogos/categorias.actions');
        const result = await createCategoria(data as { id_materia: string; nombre_categoria: string });

        if (result.success) {
            console.log('✅ Categoría añadida, recargando lista...');
            setIsModalOpen(false);
            await loadData();
        } else {
            console.error('Error al añadir categoría:', result.error);
            alert(result.error || 'Error al añadir categoría');
        }
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Categorías</h1>
            <p className="mb-6 ml-3">Clasificaciones dentro de cada materia legal</p>
            <CatalogDetailClient
                data={categorias}
                columns={["ID Materia", "Número", "Nombre", "Materia"]}
                addLabel="Añadir Categoría"
                onAddClick={() => setIsModalOpen(true)}
                filterField="nombre_materia"
                autoGenerateFilter={true}
            />
            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAdd}
                title="Añadir Categoría"
                fields={[
                    {
                        name: 'id_materia',
                        label: 'Materia',
                        type: 'select',
                        required: true,
                        options: materias.map(m => ({
                            value: m.id_materia.toString(),
                            label: m.nombre_materia
                        }))
                    },
                    { name: 'nombre_categoria', label: 'Nombre de la Categoría', required: true }
                ]}
            />
        </>
    );
}
