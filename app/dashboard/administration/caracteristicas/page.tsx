'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2, Tag } from "lucide-react";
import { getCaracteristicas, createCaracteristica, updateCaracteristica, toggleCaracteristicaHabilitado, deleteCaracteristica } from "@/app/actions/catalogos/caracteristicas.actions";
import { getTiposCaracteristicas } from "@/app/actions/catalogos/tipos-caracteristicas.actions";
import { useToast } from "@/components/ui/feedback/ToastProvider";

export default function CaracteristicasPage() {
  const [caracteristicas, setCaracteristicas] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [caracResult, tiposResult] = await Promise.all([
      getCaracteristicas(), getTiposCaracteristicas()
    ]);
    if (caracResult.success && caracResult.data) setCaracteristicas(caracResult.data);
    if (tiposResult.success && tiposResult.data) setTipos(tiposResult.data);
    setLoading(false);
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createCaracteristica(data as { id_tipo_caracteristica: string; descripcion: string });
    if (result.success) {
      handleCloseModal();
      await loadData();
    } else {
      toast.error(result.error || 'Error al añadir característica');
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
    const result = await updateCaracteristica(
      editingItem.id_tipo_caracteristica,
      editingItem.num_caracteristica,
      {
        descripcion: data.descripcion,
        new_id_tipo_caracteristica: data.id_tipo_caracteristica
      }
    );
    if (result.success) {
      handleCloseModal();
      await loadData();
    } else {
      toast.error(result.error === 'HAS_ASSOCIATIONS' ? result.message : (result.error || 'Error al actualizar característica'));
    }
  };

  const handleToggle = async (item: any) => {
    const result = await toggleCaracteristicaHabilitado(item.id_tipo_caracteristica, item.num_caracteristica);
    if (result.success) await loadData();
    else toast.error(result.error || 'Error al cambiar estado');
  };

  const handleDelete = async (item: any, motivo?: string) => {
    const result = await deleteCaracteristica(item.id_tipo_caracteristica, item.num_caracteristica, motivo);
    if (result.success) await loadData();
    else toast.error(result.error === 'HAS_ASSOCIATIONS' ? (result.message || 'No se puede eliminar') : (result.error || 'Error al eliminar'));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
  };

  return (
    <>
      <CatalogDetailClient
        data={caracteristicas}
        columns={["Descripción", "Tipo", "Habilitado"]}
        keys={["descripcion", "nombre_tipo_caracteristica", "habilitado"]}
        addLabel="Añadir Característica"
        onAddClick={() => setIsModalOpen(true)}
        loading={loading}
        hideHeader={true}
        hideBackButton={true}
        filterField="nombre_tipo_caracteristica"
        filterLabel="Tipo"
        autoGenerateFilter={true}
        renderActions={(item: any) => (
          <CatalogActionsMenu
            item={item}
            titleField="descripcion"
            onView={() => handleView(item)}
            onEdit={() => handleEdit(item)}
            onToggleHabilitado={() => handleToggle(item)}
            onDelete={(motivo) => handleDelete(item, motivo)}
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
            required: true,
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
      <CatalogViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles de la Característica"
        fields={[
          { label: "Descripción", value: viewItem?.descripcion, icon: FileText, fullWidth: true },
          { label: "Tipo", value: viewItem?.nombre_tipo_caracteristica || 'N/A', icon: Tag },
          { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
        ]}
      />
    </>
  );
}