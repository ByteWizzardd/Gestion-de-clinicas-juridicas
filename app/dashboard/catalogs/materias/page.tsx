'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getMaterias } from "@/app/actions/catalogos/materias.actions";

export default function MateriasPage() {
    const [materias, setMaterias] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            // Force reload the data
            await loadMaterias();
        } else {
            console.error('Error al añadir materia:', result.error);
            alert(result.error || 'Error al añadir materia');
        }
    };



    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Materias</h1>
            <p className="mb-6 ml-3">Áreas principales del derecho que se manejan en el sistema</p>



            <CatalogDetailClient
                data={materias}
                columns={["ID Materia", "Materia"]}
                addLabel="Añadir Materia"
                onAddClick={() => setIsModalOpen(true)}
            />
            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAdd}
                title="Añadir Materia"
                fields={[
                    { name: 'nombre_materia', label: 'Nombre de la Materia', required: true }
                ]}
            />
        </>
    );
}
