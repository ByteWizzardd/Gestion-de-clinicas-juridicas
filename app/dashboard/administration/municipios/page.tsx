'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";

import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, FileText, CheckCircle2 } from "lucide-react";
import { getMunicipios, createMunicipio, updateMunicipio, toggleMunicipioHabilitado, deleteMunicipio } from "@/app/actions/catalogos/municipios.actions";
import { getEstados } from "@/app/actions/catalogos/estados.actions";
import { useToast } from "@/components/ui/feedback/ToastProvider";

export default function MunicipiosPage() {
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [municipiosResult, estadosResult] = await Promise.all([getMunicipios(), getEstados()]);
    if (municipiosResult.success && municipiosResult.data) setMunicipios(municipiosResult.data);
    if (estadosResult.success && estadosResult.data) setEstados(estadosResult.data);
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createMunicipio(data as { id_estado: string; nombre_municipio: string });
    if (result.success) { setIsModalOpen(false); await loadData(); }
    else toast.error(result.error || 'Error al añadir municipio');
  };

  const handleEdit = (item: any) => { setEditingItem(item); setIsEditMode(true); setIsModalOpen(true); };

  const handleView = (item: any) => {
    setViewItem(item);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (!editingItem) return;
    const result = await updateMunicipio(
      editingItem.id_estado,
      editingItem.num_municipio,
      {
        nombre_municipio: data.nombre_municipio,
        id_estado: data.id_estado ? parseInt(data.id_estado) : undefined
      }
    );
    if (result.success) { setIsModalOpen(false); setIsEditMode(false); setEditingItem(null); await loadData(); }
    else toast.error(result.error || 'Error al actualizar');
  };

  const handleToggle = async (item: any) => {
    const result = await toggleMunicipioHabilitado(item.id_estado, item.num_municipio);
    if (result.success) await loadData();
    else toast.error(result.error || 'Error al cambiar estado');
  };

  const handleDelete = async (item: any, motivo?: string) => {
    const result = await deleteMunicipio(item.id_estado, item.num_municipio, motivo);
    if (result.success) await loadData();
    else toast.error(result.error === 'HAS_ASSOCIATIONS' ? (result.message || 'No se puede eliminar') : (result.error || 'Error al eliminar'));
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Municipios</h1>
      <p className="mb-6 ml-3">Municipios de Venezuela</p>
      <CatalogDetailClient
        data={municipios}
        columns={["ID Estado", "ID Municipio", "Municipio", "Estado", "Habilitado"]}
        addLabel="Añadir Municipio"
        onAddClick={() => setIsModalOpen(true)}
        renderActions={(item: any) => (
          <CatalogActionsMenu
            item={item}
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
        title={isEditMode ? "Editar Municipio" : "Añadir Municipio"}
        fields={[
          {
            name: 'id_estado',
            label: 'Estado',
            type: 'select',
            options: estados.map(e => ({ value: e.id_estado.toString(), label: e.nombre_estado })),
            required: true,
            defaultValue: isEditMode ? editingItem?.id_estado?.toString() : undefined
          },
          { name: 'nombre_municipio', label: 'Nombre del Municipio', required: true, defaultValue: isEditMode ? editingItem?.nombre_municipio : undefined }
        ]}
      />
      <CatalogViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Municipio"
        fields={[
          { label: "ID Estado", value: viewItem?.id_estado, icon: Hash },
          { label: "ID Municipio", value: viewItem?.num_municipio, icon: Hash },
          { label: "Municipio", value: viewItem?.nombre_municipio, icon: FileText, fullWidth: true },
          { label: "Estado", value: viewItem?.nombre_estado, icon: FileText },
          { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
        ]}
      />
    </>
  );
}

