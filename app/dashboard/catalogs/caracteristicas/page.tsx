'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import { getCaracteristicas, createCaracteristica, updateCaracteristica, toggleCaracteristicaHabilitado, deleteCaracteristica } from "@/app/actions/catalogos/caracteristicas.actions";
import { getTiposCaracteristicas } from "@/app/actions/catalogos/tipos-caracteristicas.actions";

export default function CaracteristicasPage() {
  const [caracteristicas, setCaracteristicas] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [caracResult, tiposResult] = await Promise.all([
      getCaracteristicas(), getTiposCaracteristicas()
    ]);
    if (caracResult.success && caracResult.data) setCaracteristicas(caracResult.data);
    if (tiposResult.success && tiposResult.data) setTipos(tiposResult.data);
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createCaracteristica(data as { id_tipo_caracteristica: string; descripcion: string });
    if (result.success) {
      handleCloseModal();
      await loadData();
    } else {
      alert(result.error || 'Error al añadir característica');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (!editingItem) return;
    const result = await updateCaracteristica(editingItem.id_tipo_caracteristica, editingItem.num_caracteristica, { descripcion: data.descripcion });
    if (result.success) {
      handleCloseModal();
      await loadData();
    } else {
      alert(result.error || 'Error al actualizar característica');
    }
  };

  const handleToggle = async (item: any) => {
    const result = await toggleCaracteristicaHabilitado(item.id_tipo_caracteristica, item.num_caracteristica);
    if (result.success) await loadData();
    else alert(result.error);
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`¿Eliminar "${item.descripcion}"?`)) return;
    const result = await deleteCaracteristica(item.id_tipo_caracteristica, item.num_caracteristica);
    if (result.success) await loadData();
    else alert(result.error === 'HAS_ASSOCIATIONS' ? result.message : result.error);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
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
        renderActions={(item: any) => (
          <CatalogActionsMenu
            item={item}
            onEdit={() => handleEdit(item)}
            onToggleHabilitado={() => handleToggle(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={isEditMode ? handleUpdate : handleAdd}
        title={isEditMode ? "Editar Característica" : "Añadir Característica"}
        fields={[
          {
            name: 'id_tipo_caracteristica',
            label: 'Tipo de Característica',
            type: 'select',
            options: tipos.map(t => ({ value: t.id_tipo.toString(), label: t.nombre_tipo_caracteristica })),
            required: !isEditMode,
            defaultValue: isEditMode ? editingItem?.id_tipo_caracteristica?.toString() : undefined
          },
          {
            name: 'descripcion',
            label: 'Descripción',
            required: true,
            defaultValue: isEditMode ? editingItem?.descripcion : undefined
          }
        ]}
      />
    </>
  );
}
