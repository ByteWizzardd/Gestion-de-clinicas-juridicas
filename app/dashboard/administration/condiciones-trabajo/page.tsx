'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2 } from "lucide-react";
import { getCondicionesTrabajo, createCondicionTrabajo, updateCondicionTrabajo, toggleCondicionTrabajoHabilitado, deleteCondicionTrabajo } from "@/app/actions/catalogos/condiciones-trabajo.actions";
import { useToast } from "@/components/ui/feedback/ToastProvider";

export default function CondicionesTrabajoPage() {
  const [condiciones, setCondiciones] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadCondiciones(); }, []);

  const loadCondiciones = async () => {
    setLoading(true);
    const result = await getCondicionesTrabajo();
    if (result.success && result.data) setCondiciones(result.data);
    setLoading(false);
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createCondicionTrabajo(data as { nombre_trabajo: string });
    if (result.success) { setIsModalOpen(false); await loadCondiciones(); }
    else toast.error(result.error || 'Error al añadir condición');
  };

  const handleEdit = (item: any) => { setEditingItem(item); setIsEditMode(true); setIsModalOpen(true); };

  const handleView = (item: any) => {
    setViewItem(item);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (!editingItem) return;
    const result = await updateCondicionTrabajo(editingItem.id_trabajo, data as { nombre_trabajo: string });
    if (result.success) { setIsModalOpen(false); setIsEditMode(false); setEditingItem(null); await loadCondiciones(); }
    else toast.error(result.error || 'Error al actualizar');
  };

  const handleToggle = async (item: any) => {
    const result = await toggleCondicionTrabajoHabilitado(item.id_trabajo);
    if (result.success) await loadCondiciones();
    else toast.error(result.error || 'Error al cambiar estado');
  };

  const handleDelete = async (item: any, motivo?: string) => {
    const result = await deleteCondicionTrabajo(item.id_trabajo, motivo);
    if (result.success) await loadCondiciones();
    else toast.error(result.error === 'HAS_ASSOCIATIONS' ? (result.message || 'No se puede eliminar') : (result.error || 'Error al eliminar'));
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Condiciones de Trabajo</h1>
      <p className="mb-6 ml-3">Condiciones laborales de los solicitantes</p>
      <CatalogDetailClient
        data={condiciones}
        columns={["Condición", "Habilitado"]}
        keys={["nombre_trabajo", "habilitado"]}
        addLabel="Añadir Condición"
        onAddClick={() => setIsModalOpen(true)}
        loading={loading}
        renderActions={(item: any) => (
          <CatalogActionsMenu
            item={item}
            titleField="nombre_trabajo"
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
        title={isEditMode ? "Editar Condición" : "Añadir Condición de Trabajo"}
        fields={[{ name: 'nombre_trabajo', label: 'Nombre de la Condición', required: true, defaultValue: isEditMode ? editingItem?.nombre_trabajo : undefined }]}
      />
      <CatalogViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles de Condición de Trabajo"
        fields={[
          { label: "Nombre Condición", value: viewItem?.nombre_trabajo, icon: FileText, fullWidth: true },
          { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
        ]}
      />
    </>
  );
}
