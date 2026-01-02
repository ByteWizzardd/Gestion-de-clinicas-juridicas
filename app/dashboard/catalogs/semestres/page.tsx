'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import { getSemestres, createSemestre } from "@/app/actions/catalogos/semestres.actions";

export default function SemestresPage() {
  const [semestres, setSemestres] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSemestres();
  }, []);

  const loadSemestres = async () => {
    const result = await getSemestres();
    if (result.success && result.data) {
      setSemestres(result.data);
    }
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createSemestre(data as { term: string; fecha_inicio: string; fecha_fin: string });

    if (result.success) {
      setIsModalOpen(false);
      await loadSemestres();
    } else {
      alert(result.error || 'Error al añadir semestre');
    }
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Semestres</h1>
      <p className="mb-6 ml-3">Períodos académicos del sistema</p>
      <CatalogDetailClient
        data={semestres}
        columns={["TERM", "Fecha Inicio", "Fecha Fin"]}
        addLabel="Añadir Semestre"
        onAddClick={() => setIsModalOpen(true)}
      />
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        title="Añadir Semestre"
        fields={[
          { name: 'term', label: 'TERM (ej: 2024-1)', required: true },
          { name: 'fecha_inicio', label: 'Fecha de Inicio (YYYY-MM-DD)', type: 'text', required: true },
          { name: 'fecha_fin', label: 'Fecha de Fin (YYYY-MM-DD)', type: 'text', required: true }
        ]}
      />
    </>
  );
}
