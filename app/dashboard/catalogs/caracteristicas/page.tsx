'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getCaracteristicas, createCaracteristica } from "@/app/actions/catalogos/caracteristicas.actions";
import { getTiposCaracteristicas } from "@/app/actions/catalogos/tipos-caracteristicas.actions";

export default function CaracteristicasPage() {
  const [caracteristicas, setCaracteristicas] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [caracResult, tiposResult] = await Promise.all([
      getCaracteristicas(),
      getTiposCaracteristicas()
    ]);

    if (caracResult.success && caracResult.data) {
      setCaracteristicas(caracResult.data);
    }
    if (tiposResult.success && tiposResult.data) {
      setTipos(tiposResult.data);
    }
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createCaracteristica(data as { id_tipo_caracteristica: string; descripcion: string });

    if (result.success) {
      setIsModalOpen(false);
      await loadData();
    } else {
      alert(result.error || 'Error al añadir característica');
    }
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Características</h1>
      <p className="mb-6 ml-3">Características de vivienda de los solicitantes</p>
      <CatalogDetailClient
        data={caracteristicas}
        columns={["ID Tipo", "ID Característica", "Descripción", "Habilitado", "Tipo"]}
        addLabel="Añadir Característica"
        onAddClick={() => setIsModalOpen(true)}
      />
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        title="Añadir Característica"
        fields={[
          {
            name: 'id_tipo_caracteristica',
            label: 'Tipo de Característica',
            type: 'select',
            options: tipos.map(t => ({ value: t.id_tipo.toString(), label: t.nombre_tipo_caracteristica })),
            required: true
          },
          { name: 'descripcion', label: 'Descripción', required: true }
        ]}
      />
    </>
  );
}
