'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2 } from "lucide-react";
import { getTiposCaracteristicas, createTipoCaracteristica, updateTipoCaracteristica, toggleTipoCaracteristicaHabilitado, deleteTipoCaracteristica } from "@/app/actions/catalogos/tipos-caracteristicas.actions";
import { useToast } from "@/components/ui/feedback/ToastProvider";

export default function TiposCaracteristicasPage() {
  const [tipos, setTipos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadTipos(); }, []);

  const loadTipos = async () => {
    setLoading(true);
    const result = await getTiposCaracteristicas();
    if (result.success && result.data) setTipos(result.data);
    setLoading(false);
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createTipoCaracteristica(data as { nombre_tipo_caracteristica: string });
    if (result.success) { setIsModalOpen(false); await loadTipos(); }
    else toast.error(result.error || 'Error al añadir tipo');
  };

  const handleEdit = (item: any) => { setEditingItem(item); setIsEditMode(true); setIsModalOpen(true); };

  const handleView = (item: any) => {
    setViewItem(item);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (!editingItem) return;
    const result = await updateTipoCaracteristica(editingItem.id_tipo, data as { nombre_tipo_caracteristica: string });
    if (result.success) { setIsModalOpen(false); setIsEditMode(false); setEditingItem(null); await loadTipos(); }
    else toast.error(result.error || 'Error al actualizar');
  };

  const handleToggle = async (item: any) => {
    const result = await toggleTipoCaracteristicaHabilitado(item.id_tipo);
    if (result.success) await loadTipos();
    else toast.error(result.error || 'Error al cambiar estado');
  };

  const handleDelete = async (item: any, motivo?: string) => {
    const result = await deleteTipoCaracteristica(item.id_tipo, motivo);
    if (result.success) await loadTipos();
    else toast.error(result.error === 'HAS_ASSOCIATIONS' ? (result.message || 'No se puede eliminar') : (result.error || 'Error al eliminar'));
  };

  return (
    <>
      <CatalogDetailClient
        data={tipos}
        columns={["Tipo Característica", "Habilitado"]}
        keys={["nombre_tipo_caracteristica", "habilitado"]}
        addLabel="Añadir Tipo"
        onAddClick={() => setIsModalOpen(true)}
        loading={loading}
        hideHeader={true}
        hideBackButton={true}
        renderActions={(item: any) => (
          <CatalogActionsMenu
            item={item}
            titleField="nombre_tipo_caracteristica"
            onView={() => handleView(item)}
            onEdit={() => handleEdit(item)}
            onToggleHabilitado={() => handleToggle(item)}
            onDelete={(motivo) => handleDelete(item, motivo)}
          />
        )}
      />
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setIsEditMode(false); setEditingItem(null); }}
        onSubmit={isEditMode ? handleUpdate : handleAdd}
        title={isEditMode ? "Editar Tipo" : "Añadir Tipo de Característica"}
        fields={[{ name: 'nombre_tipo_caracteristica', label: 'Nombre del Tipo', required: true, defaultValue: isEditMode ? editingItem?.nombre_tipo_caracteristica : undefined }]}
      />

      <div className="absolute">
        {/* Usamos dynamic import o requerimos el componente aquí para evitar problemas de orden en HMR si fuera necesario, pero el import estático está bien */}
        {/* Necesitamos importar CatalogViewModal arriba */}
      </div>
      <CatalogViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Tipo de Característica"
        fields={[
          { label: "Nombre", value: viewItem?.nombre_tipo_caracteristica, icon: FileText, fullWidth: true },
          { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
        ]}
      />
    </>
  );
}