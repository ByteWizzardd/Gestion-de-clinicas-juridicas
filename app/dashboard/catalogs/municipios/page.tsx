'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getMunicipios, getEstados, createMunicipio } from "@/app/actions/catalogos";

export default function MunicipiosPage() {
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [municipiosResult, estadosResult] = await Promise.all([
      getMunicipios(),
      getEstados()
    ]);

    if (municipiosResult.success && municipiosResult.data) {
      setMunicipios(municipiosResult.data);
    }
    if (estadosResult.success && estadosResult.data) {
      setEstados(estadosResult.data);
    }
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createMunicipio(data as { id_estado: string; nombre_municipio: string });

    if (result.success) {
      setIsModalOpen(false);
      await loadData();
    } else {
      alert(result.error || 'Error al añadir municipio');
    }
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Municipios</h1>
      <p className="mb-6 ml-3">Municipios de Venezuela</p>
      <CatalogDetailClient
        data={municipios}
        columns={["ID Estado", "Num Municipio", "Nombre", "Estado"]}
        addLabel="Añadir Municipio"
        onAddClick={() => setIsModalOpen(true)}
        disableFilter={true}
      />
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        title="Añadir Municipio"
        fields={[
          {
            name: 'id_estado',
            label: 'Estado',
            type: 'select',
            options: estados.map(e => ({ value: e.id_estado.toString(), label: e.nombre_estado })),
            required: true
          },
          { name: 'nombre_municipio', label: 'Nombre del Municipio', required: true }
        ]}
      />
    </>
  );
}
