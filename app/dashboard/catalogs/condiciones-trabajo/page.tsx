'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getCondicionesTrabajo, createCondicionTrabajo } from "@/app/actions/catalogos/condiciones-trabajo.actions";

export default function CondicionesTrabajoPage() {
  const [condiciones, setCondiciones] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCondiciones();
  }, []);

  const loadCondiciones = async () => {
    const result = await getCondicionesTrabajo();
    if (result.success && result.data) {
      setCondiciones(result.data);
    }
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createCondicionTrabajo(data as { nombre_trabajo: string });

    if (result.success) {
      setIsModalOpen(false);
      await loadCondiciones();
    } else {
      alert(result.error || 'Error al añadir condición de trabajo');
    }
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Condiciones de Trabajo</h1>
      <p className="mb-6 ml-3">Condiciones laborales de los solicitantes</p>
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
        title="Añadir Condición de Trabajo"
        fields={[
          { name: 'nombre_trabajo', label: 'Nombre de la Condición', required: true }
        ]}
      />
    </>
  );
}
