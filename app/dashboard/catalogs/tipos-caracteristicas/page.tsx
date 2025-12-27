'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getTiposCaracteristicas, createTipoCaracteristica } from "@/app/actions/catalogos";

export default function TiposCaracteristicasPage() {
  const [tipos, setTipos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    const result = await getTiposCaracteristicas();
    if (result.success && result.data) {
      setTipos(result.data);
    }
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createTipoCaracteristica(data as { nombre_tipo_caracteristica: string });

    if (result.success) {
      setIsModalOpen(false);
      await loadTipos();
    } else {
      alert(result.error || 'Error al añadir tipo de característica');
    }
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Tipos de Características</h1>
      <p className="mb-6 ml-3">Tipos de características de vivienda</p>
      <CatalogDetailClient
        data={tipos}
        columns={["ID", "Nombre"]}
        addLabel="Añadir Tipo"
        onAddClick={() => setIsModalOpen(true)}
        disableFilter={true}
      />
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        title="Añadir Tipo de Característica"
        fields={[
          { name: 'nombre_tipo_caracteristica', label: 'Nombre del Tipo', required: true }
        ]}
      />
    </>
  );
}
