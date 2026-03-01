'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';
import Table from '@/components/Table/Table';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';
import { deleteCasoAction, getCasoByIdAction, updateCasoAction } from '@/app/actions/casos';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import CaseTools from '@/components/CaseTools/CaseTools';
import { getMateriasAction } from '@/app/actions/materias';
import { ESTATUS_CASO, TRAMITES } from '@/lib/constants/status';
import CaseFormModal from '@/components/forms/CaseFormModal';

interface CasesTabProps {
  cedulaSolicitante?: string;
  casos: Array<{
    id_caso: number;
    fecha_solicitud: string | null;
    fecha_inicio_caso: string | null;
    fecha_fin_caso: string | null;
    tramite: string | null;
    estatus: string | null;
    cant_beneficiarios: number | null;
    observaciones: string | null;
    nombre_nucleo: string | null;
    nombre_materia: string | null;
    nombre_categoria: string | null;
    nombre_subcategoria: string | null;
  }>;
}

export default function CasesTab({ casos, cedulaSolicitante }: CasesTabProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [materias, setMaterias] = useState<Array<{ id_materia: number; nombre_materia: string }>>([]);

  const [searchValue, setSearchValue] = useState('');

  const [nucleoFilter, setNucleoFilter] = useState('');
  const [materiaFilter, setMateriaFilter] = useState('');
  const [tramiteFilter, setTramiteFilter] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCaseData, setSelectedCaseData] = useState<any>(null);
  const [isFetchingCase, setIsFetchingCase] = useState(false);

  const uniqueOptions = (values: Array<string | null | undefined>) => {
    const set = new Set(values.map((v) => (v ?? '').trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b)).map((v) => ({ value: v, label: v }));
  };

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const result = await getMateriasAction();
        if (result.success && result.data) {
          setMaterias(result.data);
        }
      } catch (error) {
        console.error('Error cargando materias:', error);
      }
    };

    fetchMaterias();
  }, []);

  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const canonicalMateria = (name: string): string => {
    // Normaliza nombres para que el filtro funcione aunque en BD/joins venga como "Materia Civil"
    // pero el usuario seleccione "Civil".
    const trimmed = (name ?? '').trim();
    return trimmed.replace(/^materia\s+/i, '').trim();
  };

  const nucleoOptions = useMemo(
    () => uniqueOptions(casos.map((c) => c.nombre_nucleo)),
    [casos]
  );

  const tramiteOptions = useMemo(
    () => [
      { value: TRAMITES.ASESORIA, label: 'Asesoría' },
      { value: TRAMITES.CONCILIACION_MEDIACION, label: 'Conciliación y Mediación' },
      { value: TRAMITES.REDACCION_DOCUMENTOS, label: 'Redacción documentos y/o Convenios' },
      { value: TRAMITES.ASISTENCIA_JUDICIAL, label: 'Asistencia Judicial - Casos Extremos' },
    ],
    []
  );

  const estatusOptions = useMemo(
    () => [
      { value: ESTATUS_CASO.EN_PROCESO, label: ESTATUS_CASO.EN_PROCESO },
      { value: ESTATUS_CASO.ARCHIVADO, label: ESTATUS_CASO.ARCHIVADO },
      { value: ESTATUS_CASO.ENTREGADO, label: ESTATUS_CASO.ENTREGADO },
      { value: ESTATUS_CASO.ASESORIA, label: ESTATUS_CASO.ASESORIA },
    ],
    []
  );

  const materiaOptions = useMemo(() => {
    const raw = materias
      .map((m) => {
        const canon = canonicalMateria(m.nombre_materia);
        return { value: canon, label: canon };
      })
      .filter((m) => Boolean(m.value?.trim()));

    // Dedupe por normalización (por si existiera "Materia Civil" y "Civil")
    const deduped = Array.from(
      new Map(raw.map((o) => [normalizeText(o.value), o] as const)).values()
    );

    // Orden solicitado: Civil, Penal, Laboral, Mercantil, Administrativa, Otros
    const rank = (label: string): number => {
      const n = normalizeText(label);
      if (n.includes('civil')) return 0;
      if (n.includes('penal')) return 1;
      if (n.includes('laboral')) return 2;
      if (n.includes('mercantil')) return 3;
      if (n.includes('administrativa')) return 4;
      if (n.includes('otros')) return 999;
      return 50;
    };

    return deduped.sort((a, b) => {
      const ra = rank(a.label);
      const rb = rank(b.label);
      if (ra !== rb) return ra - rb;
      return a.label.localeCompare(b.label);
    });
  }, [materias]);

  const getCasoFechaSolicitudISO = (caso: CasesTabProps['casos'][number]): string | null => {
    const anyCaso = caso as unknown as Record<string, unknown>;
    const raw =
      (typeof caso.fecha_solicitud === 'string' && caso.fecha_solicitud) ||
      (typeof anyCaso.fecha_solicitud_str === 'string' && anyCaso.fecha_solicitud_str) ||
      null;

    if (!raw) return null;
    const iso = raw.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
  };

  const filteredCasos = useMemo(() => {
    return casos.filter((c) => {
      const normalizedSearch = normalizeText(searchValue);

      const materiaDisplay = c.nombre_materia || '';
      const categoria = c.nombre_categoria?.trim() || '';
      const subcategoria = c.nombre_subcategoria?.trim() || '';

      const matchesSearch =
        !searchValue ||
        c.id_caso.toString().includes(searchValue) ||
        normalizeText(c.tramite || '').includes(normalizedSearch) ||
        normalizeText(c.estatus || '').includes(normalizedSearch) ||
        normalizeText(c.nombre_nucleo || '').includes(normalizedSearch) ||
        normalizeText(materiaDisplay).includes(normalizedSearch) ||
        normalizeText(categoria).includes(normalizedSearch) ||
        normalizeText(subcategoria).includes(normalizedSearch);

      if (!matchesSearch) return false;

      if (nucleoFilter && (c.nombre_nucleo ?? '') !== nucleoFilter) return false;
      if (materiaFilter && canonicalMateria(c.nombre_materia ?? '') !== materiaFilter) return false;
      if (tramiteFilter && (c.tramite ?? '') !== tramiteFilter) return false;
      if (estatusFilter && (c.estatus ?? '') !== estatusFilter) return false;

      const iso = getCasoFechaSolicitudISO(c);
      if (fechaInicio || fechaFin) {
        if (!iso) return false;
        if (fechaInicio && iso < fechaInicio) return false;
        if (fechaFin && iso > fechaFin) return false;
      }

      return true;
    });
  }, [casos, searchValue, nucleoFilter, materiaFilter, tramiteFilter, estatusFilter, fechaInicio, fechaFin]);

  if (!casos || casos.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-8 text-center transition-colors">
        <FileText className="w-12 h-12 text-[var(--card-text-muted)] mx-auto mb-4 opacity-70" />
        <p className="text-[var(--card-text-muted)] text-lg">No hay casos asociados a este solicitante</p>
      </div>
    );
  }
  const tableData = filteredCasos.map((caso) => ({
    id_caso: caso.id_caso,
    fecha_solicitud: (() => {
      const anyCaso = caso as unknown as Record<string, unknown>;
      const raw =
        (typeof caso.fecha_solicitud === 'string' && caso.fecha_solicitud) ||
        (typeof anyCaso.fecha_solicitud_str === 'string' && anyCaso.fecha_solicitud_str) ||
        null;
      return raw ? formatDate(raw) : 'N/A';
    })(),
    tramite: caso.tramite || 'N/A',
    estatus: caso.estatus || 'N/A',
    nucleo: caso.nombre_nucleo || 'N/A',
    materia: (() => {
      const materia = caso.nombre_materia || 'Sin materia';
      const categoria = caso.nombre_categoria?.trim() || '';
      const subcategoria = caso.nombre_subcategoria?.trim() || '';

      const hasCategoria = categoria && categoria.toLowerCase() !== 'sin categoría' && categoria.toLowerCase() !== 'n/a';
      const hasSubcategoria = subcategoria && subcategoria.toLowerCase() !== 'sin subcategoría' && subcategoria.toLowerCase() !== 'n/a';

      let text = materia;
      if (hasCategoria && hasSubcategoria) {
        text += ` - ${categoria} ${subcategoria}`;
      } else if (hasCategoria) {
        text += ` - ${categoria}`;
      } else if (hasSubcategoria) {
        text += ` - ${subcategoria}`;
      }
      return text;
    })()
  }));

  const handleView = (data: Record<string, unknown>) => {
    const idCaso = data.id_caso as number;
    if (idCaso) {
      router.push(`/dashboard/cases/${idCaso}`);
    }
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    const idCaso = data.id_caso as number;
    if (!idCaso) return;

    try {
      setIsFetchingCase(true);
      const result = await getCasoByIdAction(idCaso);
      if (result.success && result.data) {
        setSelectedCaseData(result.data);
        setIsEditModalOpen(true);
      } else {
        toast.error(result.error?.message || 'No se pudo cargar la información del caso');
      }
    } catch (error) {
      console.error('Error al obtener caso:', error);
      toast.error('Ocurrió un error al cargar el caso');
    } finally {
      setIsFetchingCase(false);
    }
  };

  const handleSubmitEdit = async (formData: any) => {
    if (!selectedCaseData?.id_caso) return;

    try {
      const result = await updateCasoAction(selectedCaseData.id_caso, formData);
      if (result.success) {
        toast.success('Caso actualizado correctamente');
        setIsEditModalOpen(false);
        setSelectedCaseData(null);
        router.refresh();
      } else {
        toast.error(result.error?.message || 'Error al actualizar el caso');
      }
    } catch (error) {
      console.error('Error al actualizar caso:', error);
      toast.error('Ocurrió un error al actualizar el caso');
    }
  };

  const handleDelete = (data: Record<string, unknown>) => {
    const idCaso = data.id_caso as number;
    if (idCaso) {
      setItemToDelete(idCaso);
      setDeleteMotivo('');
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async (motivo?: string) => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteCasoAction(itemToDelete, motivo || 'Sin motivo especificado');
      if (result.success) {
        toast.success('Caso eliminado correctamente');
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        setDeleteMotivo('');
        router.refresh(); // O recargar datos si es necesario
      } else {
        toast.error(result.error?.message || 'Error desconocido', 'Error al eliminar');
      }
    } catch (e) {
      console.error(e);
      toast.error('Ocurrió un error al intentar eliminar el caso');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <CaseTools
        addLabel="Añadir Caso"
        onAddClick={() => {
          const rawCedula = (cedulaSolicitante ?? '').trim();
          if (!rawCedula) {
            router.push('/dashboard/cases');
            return;
          }

          const tipo = rawCedula.charAt(0).toUpperCase();
          const numero = rawCedula.slice(1).replace(/[^0-9]/g, '');
          const cedulaParam = numero ? `${tipo}${numero}` : rawCedula;
          const tipoParam = tipo || 'V';

          router.push(`/dashboard/cases?cedula=${encodeURIComponent(cedulaParam)}&cedulaTipo=${encodeURIComponent(tipoParam)}`);
        }}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        nucleoLabel="Núcleo"
        nucleoAllLabel="Todos los núcleos"
        nucleoFilter={nucleoFilter}
        onNucleoChange={setNucleoFilter}
        nucleoOptions={nucleoOptions}
        materiaFilter={materiaFilter}
        onMateriaChange={setMateriaFilter}
        materiaOptions={materiaOptions}
        tramiteFilter={tramiteFilter}
        onTramiteChange={setTramiteFilter}
        tramiteOptions={tramiteOptions}
        estatusLabel="Estatus"
        estatusFilter={estatusFilter}
        onEstatusChange={setEstatusFilter}
        estatusOptions={estatusOptions}
        showDateRange={true}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        onFechaInicioChange={setFechaInicio}
        onFechaFinChange={setFechaFin}
        onClearFilters={() => {
          setSearchValue('');
          setNucleoFilter('');
          setMateriaFilter('');
          setTramiteFilter('');
          setEstatusFilter('');
          setFechaInicio('');
          setFechaFin('');
        }}
      />
      <Table
        data={tableData}
        columns={['Código', 'Fecha Solicitud', 'Trámite', 'Estatus', 'Núcleo', 'Materia']}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowsPerPage={10}
      />
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
          setDeleteMotivo('');
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar caso"
        message={
          <div className="space-y-4">
            <p>
              ¿Estás seguro de que deseas eliminar el caso <strong>{itemToDelete}</strong>?
            </p>
            <p className="text-red-600 font-semibold">
              Esta acción es irreversible y eliminará todos los datos asociados (citas, documentos, etc.).
            </p>
          </div>
        }
        confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
        cancelLabel="Cancelar"
        confirmVariant="danger"
        showMotive={true}
        motiveValue={deleteMotivo}
        onMotiveChange={setDeleteMotivo}
        motivePlaceholder="Indique el motivo de la eliminación..."
        disabled={isDeleting}
      />

      <CaseFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCaseData(null);
        }}
        onSubmit={handleSubmitEdit}
        isEditing={true}
        initialData={selectedCaseData}
      />
    </div>
  );
}