'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, Calendar, CheckCircle2 } from "lucide-react";
import { getSemestres, createSemestre, updateSemestre, toggleSemestreHabilitado, deleteSemestre } from "@/app/actions/catalogos/semestres.actions";

export default function SemestresPage() {
  const [semestres, setSemestres] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);

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

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleView = (item: any) => {
    setViewItem(item);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (!editingItem) return;
    const result = await updateSemestre(editingItem.term, { fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin });
    if (result.success) {
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingItem(null);
      await loadSemestres();
    } else {
      alert(result.error || 'Error al actualizar semestre');
    }
  };

  const handleToggleHabilitado = async (item: any) => {
    const result = await toggleSemestreHabilitado(item.term);
    if (result.success) await loadSemestres();
    else alert(result.error || 'Error al cambiar estado');
  };

  const handleDelete = async (item: any, motivo?: string) => {
    const result = await deleteSemestre(item.term, motivo);
    if (result.success) {
      await loadSemestres();
    } else {
      if (result.error === 'HAS_ASSOCIATIONS') {
        alert(result.message || 'No se puede eliminar este semestre.');
      } else {
        alert(result.error || 'Error al eliminar semestre');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Semestres</h1>
      <p className="mb-6 ml-3">Períodos académicos del sistema</p>
      <CatalogDetailClient
        data={semestres}
        columns={["Semestre", "Fecha Inicio", "Fecha Fin", "Habilitado"]}
        addLabel="Añadir Semestre"
        onAddClick={() => setIsModalOpen(true)}
        renderActions={(item: any) => (
          <CatalogActionsMenu
            item={item}
            onView={() => handleView(item)}
            onEdit={() => handleEdit(item)}
            onToggleHabilitado={() => handleToggleHabilitado(item)}
            onDelete={(motivo) => handleDelete(item, motivo)}
          />
        )}
      />
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={isEditMode ? handleUpdate : handleAdd}
        title={isEditMode ? "Editar Semestre" : "Añadir Semestre"}
        fields={[
          { name: 'term', label: 'TERM (ej: 2024-1)', required: !isEditMode, defaultValue: isEditMode ? editingItem?.term : undefined },
          { name: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date', required: true, defaultValue: isEditMode ? editingItem?.fecha_inicio : undefined },
          { name: 'fecha_fin', label: 'Fecha de Fin', type: 'date', required: true, defaultValue: isEditMode ? editingItem?.fecha_fin : undefined }
        ]}
      />
      <CatalogViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Semestre"
        fields={[
          { label: "Semestre (TERM)", value: viewItem?.term, icon: Hash, fullWidth: true },
          { label: "Fecha de Inicio", value: viewItem?.fecha_inicio, icon: Calendar },
          { label: "Fecha de Fin", value: viewItem?.fecha_fin, icon: Calendar },
          { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
        ]}
      />
    </>
  );
}
