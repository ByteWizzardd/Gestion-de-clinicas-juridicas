'use client';

import { useState, useEffect } from 'react';
import CatalogDetailClient from "@/components/catalogs/CatalogDetailClient";
import CatalogFormModal from "@/components/catalogs/CatalogFormModal";
import CatalogActionsMenu from "@/components/catalogs/CatalogActionsMenu";
import CatalogViewModal from "@/components/catalogs/CatalogViewModal";
import { Hash, Calendar, CheckCircle2 } from "lucide-react";
import { getSemestres, createSemestre, updateSemestre, toggleSemestreHabilitado, deleteSemestre, checkSemestreExists } from "@/app/actions/catalogos/semestres.actions";
import { useToast } from "@/components/ui/feedback/ToastProvider";

export default function SemestresPage() {
  const [semestres, setSemestres] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSemestres();
  }, []);

  const loadSemestres = async () => {
    setLoading(true);
    const result = await getSemestres();
    if (result.success && result.data) {
      setSemestres(result.data);
    }
    setLoading(false);
  };

  const handleAdd = async (data: Record<string, string>) => {
    const result = await createSemestre(data as { term: string; fecha_inicio: string; fecha_fin: string });
    if (result.success) {
      setIsModalOpen(false);
      await loadSemestres();
    } else {
      toast.error(result.error || 'Error al añadir semestre');
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
    const result = await updateSemestre(editingItem.term, {
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      new_term: data.term
    });
    if (result.success) {
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingItem(null);
      await loadSemestres();
    } else {
      toast.error(result.error || 'Error al actualizar semestre');
    }
  };

  const handleToggleHabilitado = async (item: any) => {
    const result = await toggleSemestreHabilitado(item.term);
    if (result.success) await loadSemestres();
    else toast.error(result.error || 'Error al cambiar estado');
  };

  const handleDelete = async (item: any, motivo?: string) => {
    const result = await deleteSemestre(item.term, motivo);
    if (result.success) {
      await loadSemestres();
    } else {
      if (result.error === 'HAS_ASSOCIATIONS') {
        toast.error(result.message || 'No se puede eliminar este semestre.');
      } else {
        toast.error(result.error || 'Error al eliminar semestre');
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
      <CatalogDetailClient
        data={semestres}
        columns={["Semestre", "Fecha Inicio", "Fecha Fin", "Habilitado"]}
        keys={["term", "fecha_inicio", "fecha_fin", "habilitado"]}
        addLabel="Añadir Semestre"
        onAddClick={() => setIsModalOpen(true)}
        loading={loading}
        hideHeader={true}
        hideBackButton={true}
        renderActions={(item: any) => (
          <CatalogActionsMenu
            item={item}
            titleField="term"
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
          {
            name: 'term',
            label: 'TERM (ej: 2026-15)',
            required: true,
            defaultValue: isEditMode ? editingItem?.term : undefined,
            validate: (value: string, formData: Record<string, string>) => {
              if (!/^\d{4}-(15|25)$/.test(value)) return 'Formato inválido. Use YYYY-15 o YYYY-25';
              return undefined;
            },
            asyncValidate: !isEditMode ? async (value: string) => {
              if (!value) return undefined;
              const result = await checkSemestreExists(value);
              if (result.exists) return 'Este TERM ya existe';
              return undefined;
            } : undefined
          },
          {
            name: 'fecha_inicio',
            label: 'Fecha de Inicio',
            type: 'date',
            required: true,
            defaultValue: isEditMode ? editingItem?.fecha_inicio : undefined,
            validate: (value: string | Date, formData: Record<string, string>) => {
              if (!value) return undefined;
              // Ensure value is treated as string for validation
              const strValue = value instanceof Date
                ? value.toISOString().split('T')[0]
                : String(value);

              if (formData.term && /^\d{4}-(15|25)$/.test(formData.term)) {
                const termYear = formData.term.substring(0, 4);
                // Extract year safely
                const startYear = strValue.includes('-') ? strValue.split('-')[0] : '';

                if (startYear && startYear !== termYear) {
                  return `El año de inicio (${startYear}) debe coincidir con el término (${termYear})`;
                }
              }
              return undefined;
            }
          },
          {
            name: 'fecha_fin',
            label: 'Fecha de Fin',
            type: 'date',
            required: true,
            defaultValue: isEditMode ? editingItem?.fecha_fin : undefined,
            validate: (value: string, formData: Record<string, string>) => {
              if (formData.fecha_inicio && value <= formData.fecha_inicio) {
                return 'La fecha de fin debe ser posterior a la fecha de inicio';
              }
              return undefined;
            }
          }
        ]}
      />
      <CatalogViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Semestre"
        fields={[
          { label: "Semestre (TERM)", value: viewItem?.term, icon: Hash, fullWidth: true },
          { label: "Fecha de Inicio", value: viewItem?.fecha_inicio ? new Date(viewItem.fecha_inicio).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '', icon: Calendar },
          { label: "Fecha de Fin", value: viewItem?.fecha_fin ? new Date(viewItem.fecha_fin).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '', icon: Calendar },
          { label: "Habilitado", value: viewItem?.habilitado, icon: CheckCircle2 }
        ]}
      />
    </>
  );
}