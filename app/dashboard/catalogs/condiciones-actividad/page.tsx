'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getCondicionesActividad, createCondicionActividad } from "@/app/actions/catalogos/condiciones-actividad.actions";

export default function CondicionesActividadPage() {
  const [condiciones, setCondiciones] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCondiciones();
  }, []);

  const loadCondiciones = async () => {
    const result = await getCondicionesActividad();
    if (result.success && result.data) {
      setCondiciones(result.data);
    }
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createCondicionActividad(data as { nombre_actividad: string });

    if (result.success) {
      setIsModalOpen(false);
      await loadCondiciones();
    } else {
      alert(result.error || 'Error al añadir condición de actividad');
    }
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Condiciones de Actividad</h1>
      <p className="mb-6 ml-3">Condiciones de actividad de los solicitantes</p>
      <CatalogDetailClient
        data={condiciones}
        columns={["ID", "Nombre"]}
        addLabel="Añadir Condición"
        onAddClick={() => setIsModalOpen(true)}
        disableFilter={true}
      />
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        title="Añadir Condición de Actividad"
        fields={[
          { name: 'nombre_actividad', label: 'Nombre de la Condición', required: true }
        ]}
      />
    </>
  );
}
