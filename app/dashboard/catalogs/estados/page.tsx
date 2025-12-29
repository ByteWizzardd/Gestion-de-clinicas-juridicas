'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getEstados } from "@/app/actions/catalogos/estados.actions";

export default function EstadosPage() {
    const [estados, setEstados] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            console.log('✅ Estado añadido, recargando lista...');
            setIsModalOpen(false);
            await loadEstados();
        } else {
            console.error('Error al añadir estado:', result.error);
            alert(result.error || 'Error al añadir estado');
        }
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Estados</h1>
            <p className="mb-6 ml-3">Estados del país registrados en el sistema</p>
            <CatalogDetailClient
                data={estados}
                columns={["ID", "Nombre"]}
                addLabel="Añadir Estado"
                onAddClick={() => setIsModalOpen(true)}
                disableFilter={true}
            />
            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAdd}
                title="Añadir Estado"
                fields={[
                    { name: 'nombre_estado', label: 'Nombre del Estado', required: true }
                ]}
            />
        </>
    );
}
