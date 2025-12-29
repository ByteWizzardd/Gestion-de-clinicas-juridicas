'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getNucleos, createNucleo } from "@/app/actions/catalogos/nucleos.actions";
import { getParroquias } from "@/app/actions/catalogos/parroquias.actions";

export default function NucleosPage() {
    const [nucleos, setNucleos] = useState<any[]>([]);
    const [parroquias, setParroquias] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [nucleosResult, parroquiasResult] = await Promise.all([
            getNucleos(),
            getParroquias()
        ]);

        if (nucleosResult.success && nucleosResult.data) {
            setNucleos(nucleosResult.data);
        }
        if (parroquiasResult.success && parroquiasResult.data) {
            setParroquias(parroquiasResult.data);
        }
    };

    const handleAdd = async (data: Record<string, string>) => {
        const result = await createNucleo(data as { id_parroquia: string; nombre_nucleo: string });

        if (result.success) {
            setIsModalOpen(false);
            await loadData();
        } else {
            alert(result.error || 'Error al añadir núcleo');
        }
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Núcleos</h1>
            <p className="mb-6 ml-3">Núcleos universitarios</p>
            <CatalogDetailClient
                data={nucleos}
                columns={["ID Parroquia", "Nombre", "Parroquia"]}
                addLabel="Añadir Núcleo"
                onAddClick={() => setIsModalOpen(true)}
                disableFilter={true}
            />
            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAdd}
                title="Añadir Núcleo"
                fields={[
                    {
                        name: 'id_parroquia',
                        label: 'Parroquia',
                        type: 'select',
                        options: parroquias
                            .filter(p => p.id_parroquia != null)
                            .map(p => ({ value: p.id_parroquia.toString(), label: p.nombre_parroquia })),
                        required: true
                    },
                    { name: 'nombre_nucleo', label: 'Nombre del Núcleo', required: true }
                ]}
            />
        </>
    );
}
