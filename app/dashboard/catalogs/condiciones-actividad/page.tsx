'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import { getCondicionesActividad, createCondicionActividad, updateCondicionActividad, toggleCondicionActividadHabilitado, deleteCondicionActividad } from "@/app/actions/catalogos/condiciones-actividad.actions";

export default function CondicionesActividadPage() {
  const [condiciones, setCondiciones] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => { loadCondiciones(); }, []);

  const loadCondiciones = async () => {
    const result = await getCondicionesActividad();
    if (result.success && result.data) setCondiciones(result.data);
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createCondicionActividad(data as { nombre_actividad: string });
    if (result.success) { setIsModalOpen(false); await loadCondiciones(); }
    else alert(result.error || 'Error al añadir condición');
  };

  const handleEdit = (item: any) => { setEditingItem(item); setIsEditMode(true); setIsModalOpen(true); };

  const handleUpdate = async (data: Record<string, string>) => {
    if (!editingItem) return;
    const result = await updateCondicionActividad(editingItem.id_actividad, data as { nombre_actividad: string });
    if (result.success) { setIsModalOpen(false); setIsEditMode(false); setEditingItem(null); await loadCondiciones(); }
    else alert(result.error || 'Error al actualizar');
  };

  const handleToggle = async (item: any) => {
    const result = await toggleCondicionActividadHabilitado(item.id_actividad);
    if (result.success) await loadCondiciones();
    else alert(result.error);
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`¿Eliminar "${item.nombre_actividad}"?`)) return;
    const result = await deleteCondicionActividad(item.id_actividad);
    if (result.success) await loadCondiciones();
    else alert(result.error === 'HAS_ASSOCIATIONS' ? result.message : result.error);
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Condiciones de Actividad</h1>
      <p className="mb-6 ml-3">Condiciones de actividad de los solicitantes</p>
      <CatalogDetailClient
        data={condiciones}
        columns={["ID Actividad", "Condición Actividad", "Habilitado"]}
        addLabel="Añadir Condición"
        onAddClick={() => setIsModalOpen(true)}
        renderActions={(item: any) => (
          <CatalogActionsMenu item={item} onEdit={() => handleEdit(item)} onToggleHabilitado={() => handleToggle(item)} onDelete={() => handleDelete(item)} />
        )}
      />
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setIsEditMode(false); setEditingItem(null); }}
        onSubmit={isEditMode ? handleUpdate : handleAdd}
        title={isEditMode ? "Editar Condición" : "Añadir Condición de Actividad"}
        fields={[{ name: 'nombre_actividad', label: 'Nombre de la Condición', required: true, defaultValue: isEditMode ? editingItem?.nombre_actividad : undefined }]}
      />
    </>
  );
}
