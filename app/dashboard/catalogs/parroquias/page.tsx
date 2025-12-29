'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getParroquias, createParroquia } from "@/app/actions/catalogos/parroquias.actions";
import { getEstados } from "@/app/actions/catalogos/estados.actions";
import { getMunicipios } from "@/app/actions/catalogos/municipios.actions";

export default function ParroquiasPage() {
    const [parroquias, setParroquias] = useState<any[]>([]);
    const [estados, setEstados] = useState<any[]>([]);
    const [municipios, setMunicipios] = useState<any[]>([]);
    const [filteredMunicipios, setFilteredMunicipios] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [parroquiasResult, estadosResult, municipiosResult] = await Promise.all([
            getParroquias(),
            getEstados(),
            getMunicipios()
        ]);

        if (parroquiasResult.success && parroquiasResult.data) setParroquias(parroquiasResult.data);
        if (estadosResult.success && estadosResult.data) setEstados(estadosResult.data);
        if (municipiosResult.success && municipiosResult.data) setMunicipios(municipiosResult.data);
    };

    const handleEstadoChange = (estadoId: string) => {
        const filtered = municipios.filter(m => m.id_estado.toString() === estadoId);
        setFilteredMunicipios(filtered);
    };

    const handleAdd = async (data: Record<string, string>) => {
        const result = await createParroquia(data as { id_municipio: string; nombre_parroquia: string });

        if (result.success) {
            setIsModalOpen(false);
            setFilteredMunicipios([]);
            await loadData();
        } else {
            alert(result.error || 'Error al añadir parroquia');
        }
    };

    return (
        <>
            <h1 className="text-4xl m-3 font-semibold font-primary">Parroquias</h1>
            <p className="mb-6 ml-3">Parroquias de Venezuela</p>
            <CatalogDetailClient
                data={parroquias}
                columns={["ID Estado", "Número Municipio", "Número Parroquia", "Nombre", "Estado", "Municipio"]}
                addLabel="Añadir Parroquia"
                onAddClick={() => setIsModalOpen(true)}
                disableFilter={true}
            />
            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFilteredMunicipios([]);
                }}
                onSubmit={handleAdd}
                title="Añadir Parroquia"
                fields={[
                    {
                        name: 'id_estado_temp',
                        label: 'Estado',
                        type: 'select',
                        options: estados.map(e => ({ value: e.id_estado.toString(), label: e.nombre_estado })),
                        required: true
                    },
                    {
                        name: 'id_municipio',
                        label: 'Municipio',
                        type: 'select',
                        options: filteredMunicipios.map(m => ({ value: m.id_municipio.toString(), label: m.nombre_municipio })),
                        required: true
                    },
                    { name: 'nombre_parroquia', label: 'Nombre de la Parroquia', required: true }
                ]}
            />
        </>
    );
}
