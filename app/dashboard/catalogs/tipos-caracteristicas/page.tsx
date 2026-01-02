'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import { getTiposCaracteristicas, createTipoCaracteristica, updateTipoCaracteristica, toggleTipoCaracteristicaHabilitado, deleteTipoCaracteristica } from "@/app/actions/catalogos/tipos-caracteristicas.actions";

export default function TiposCaracteristicasPage() {
  const [tipos, setTipos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => { loadTipos(); }, []);

  const loadTipos = async () => {
    const result = await getTiposCaracteristicas();
    if (result.success && result.data) setTipos(result.data);
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createTipoCaracteristica(data as { nombre_tipo_caracteristica: string });
    if (result.success) { setIsModalOpen(false); await loadTipos(); }
    else alert(result.error || 'Error al añadir tipo');
  };

  const handleEdit = (item: any) => { setEditingItem(item); setIsEditMode(true); setIsModalOpen(true); };

  const handleUpdate = async (data: Record<string, string>) => {
    if (!editingItem) return;
    const result = await updateTipoCaracteristica(editingItem.id_tipo_caracteristica, data as { nombre_tipo_caracteristica: string });
    if (result.success) { setIsModalOpen(false); setIsEditMode(false); setEditingItem(null); await loadTipos(); }
    else alert(result.error || 'Error al actualizar');
  };

  const handleToggle = async (item: any) => {
    const result = await toggleTipoCaracteristicaHabilitado(item.id_tipo_caracteristica);
    if (result.success) await loadTipos();
    else alert(result.error);
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`¿Eliminar "${item.nombre_tipo_caracteristica}"?`)) return;
    const result = await deleteTipoCaracteristica(item.id_tipo_caracteristica);
    if (result.success) await loadTipos();
    else alert(result.error === 'HAS_ASSOCIATIONS' ? result.message : result.error);
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Tipos de Características</h1>
      <p className="mb-6 ml-3">Tipos de características de vivienda</p>
      <CatalogDetailClient
        data={tipos}
        columns={["ID Tipo", "Tipo Característica", "Habilitado"]}
        addLabel="Añadir Tipo"
        onAddClick={() => setIsModalOpen(true)}
        renderActions={(item: any) => (
          <CatalogActionsMenu item={item} onEdit={() => handleEdit(item)} onToggleHabilitado={() => handleToggle(item)} onDelete={() => handleDelete(item)} />
        )}
      />
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setIsEditMode(false); setEditingItem(null); }}
        onSubmit={isEditMode ? handleUpdate : handleAdd}
        title={isEditMode ? "Editar Tipo" : "Añadir Tipo de Característica"}
        fields={[{ name: 'nombre_tipo_caracteristica', label: 'Nombre del Tipo', required: true, defaultValue: isEditMode ? editingItem?.nombre_tipo_caracteristica : undefined }]}
      />
    </>
  );
}
