'use client';

import { useState } from 'react';
import { Calendar, User, Users, FileText, Building2, Scale, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate, calculateAge } from '@/lib/utils/date-formatter';
import EditBeneficiaryModal from '../modals/EditBeneficiaryModal';
import { deleteBeneficiarioAction } from '@/app/actions/beneficiarios';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';
import { getCaseSemestersAction, addCaseToSemesterAction, removeCaseFromSemesterAction } from '@/app/actions/casos';
import { getSemestres } from '@/app/actions/catalogos/semestres.actions';
import Modal from '@/components/ui/feedback/Modal';
import Select from '@/components/forms/Select';
import Button from '@/components/ui/Button';
import { useEffect } from 'react';

interface GeneralInfoTabProps {
  caso: {
    id_caso: number;
    fecha_solicitud: string | null;
    fecha_inicio_caso: string | null;
    fecha_fin_caso: string | null;
    tramite: string | null;
    estatus: string | null;
    observaciones: string | null;
    nombre_nucleo: string | null;
    nombre_materia: string | null;
    nombre_categoria: string | null;
    nombre_subcategoria: string | null;
    nombre_ambito_legal: string | null;
    cedula: string | null;
    nombres_solicitante: string | null;
    apellidos_solicitante: string | null;
    nombre_completo_solicitante: string | null;
    beneficiarios?: Array<{
      num_beneficiario: number;
      cedula: string | null;
      nombres: string;
      apellidos: string;
      fecha_nac: string;
      sexo: string;
      tipo_beneficiario: string;
      parentesco: string;
      nombre_completo: string;
    }>;
  };
  onRefresh?: () => void;
}

export default function GeneralInfoTab({ caso, onRefresh }: GeneralInfoTabProps) {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<{ num: number, nombre: string } | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');

  // Confirm delete semester state
  const [deleteSemesterConfirmOpen, setDeleteSemesterConfirmOpen] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<string | null>(null);


  // Semesters State
  const [semesters, setSemesters] = useState<Array<{ term: string, fecha_inicio: string, fecha_fin: string }>>([]);
  const [availableSemesters, setAvailableSemesters] = useState<Array<{ term: string }>>([]);
  const [addSemesterModalOpen, setAddSemesterModalOpen] = useState(false);
  const [selectedSemesterToAdd, setSelectedSemesterToAdd] = useState('');
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  useEffect(() => {
    fetchSemesters();
  }, [caso.id_caso]);

  const fetchSemesters = async () => {
    setLoadingSemesters(true);
    try {
      const result = await getCaseSemestersAction(caso.id_caso);
      if (result.success && result.data) {
        setSemesters(result.data);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoadingSemesters(false);
    }
  };

  const handleOpenAddSemester = async () => {
    try {
      const result = await getSemestres();
      if (result.success && result.data) {
        // Filter out semesters already assigned
        const currentTerms = new Set(semesters.map(s => s.term));
        const available = result.data.filter((s: any) => !currentTerms.has(s.term));
        setAvailableSemesters(available);
      }
      setAddSemesterModalOpen(true);
    } catch (error) {
      toast.error('Error al cargar lista de semestres');
    }
  };

  const handleAddSemester = async () => {
    if (!selectedSemesterToAdd) return;
    setIsAddingSemester(true);
    try {
      const result = await addCaseToSemesterAction(caso.id_caso, selectedSemesterToAdd);
      if (result.success) {
        toast.success('Semestre agregado correctamente');
        setAddSemesterModalOpen(false);
        setSelectedSemesterToAdd('');
        fetchSemesters();
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.error?.message || 'Error al agregar semestre');
      }
    } catch (error) {
      toast.error('Error inesperado');
    } finally {
      setIsAddingSemester(false);
    }
  };

  const handleRemoveSemester = (term: string) => {
    setSemesterToDelete(term);
    setDeleteSemesterConfirmOpen(true);
  };

  const confirmRemoveSemester = async () => {
    if (!semesterToDelete) return;

    try {
      const result = await removeCaseFromSemesterAction(caso.id_caso, semesterToDelete);
      if (result.success) {
        toast.success('Semestre eliminado correctamente');
        fetchSemesters();
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.error?.message || 'Error al eliminar semestre');
      }
    } catch (error) {
      toast.error('Error inesperado');
    } finally {
      setDeleteSemesterConfirmOpen(false);
      setSemesterToDelete(null);
    }
  };

  const formatSexo = (sexo: string | null) => {
    if (!sexo) return 'No especificado';
    return sexo === 'M' ? 'Masculino' : 'Femenino';
  };

  const handleDeleteClick = (numBeneficiario: number, nombreCompleto: string) => {
    setBeneficiaryToDelete({ num: numBeneficiario, nombre: nombreCompleto });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!beneficiaryToDelete) return;

    if (!deleteMotivo.trim()) {
      toast.error('Debes ingresar un motivo para eliminar el beneficiario');
      return;
    }

    try {
      const result = await deleteBeneficiarioAction({
        id_caso: caso.id_caso,
        num_beneficiario: beneficiaryToDelete.num,
        motivo: deleteMotivo.trim()
      });

      if (result.success) {
        toast.success(`Beneficiario ${beneficiaryToDelete.nombre} eliminado correctamente`);
        router.refresh(); // Mantiene estado de server components actualizado
        if (onRefresh) onRefresh(); // Actualiza el estado local del cliente
      } else {
        toast.error(result.error?.message || 'Error desconocido', 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error al eliminar beneficiario:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setDeleteModalOpen(false);
      setBeneficiaryToDelete(null);
      setDeleteMotivo('');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Información General del Caso */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Información General del Caso
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Código del Caso</label>
            <p className="text-base text-gray-900 mt-1">{caso.id_caso}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Estatus</label>
            <p className="text-base text-gray-900 mt-1">{caso.estatus || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Solicitud</label>
            <p className="text-base text-gray-900 mt-1">
              {caso.fecha_solicitud ? formatDate(caso.fecha_solicitud) : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Inicio</label>
            <p className="text-base text-gray-900 mt-1">
              {caso.fecha_inicio_caso ? formatDate(caso.fecha_inicio_caso) : 'N/A'}
            </p>
          </div>
          {caso.fecha_fin_caso && (
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Fin</label>
              <p className="text-base text-gray-900 mt-1">
                {formatDate(caso.fecha_fin_caso)}
              </p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Trámite</label>
            <p className="text-base text-gray-900 mt-1">{caso.tramite || 'N/A'}</p>
          </div>
          {caso.nombre_nucleo && (
            <div>
              <label className="text-sm font-medium text-gray-500">Núcleo</label>
              <p className="text-base text-gray-900 mt-1">
                {caso.nombre_nucleo}
              </p>
            </div>
          )}
          {caso.nombre_materia && (
            <div className="col-span-1 sm:col-span-2">
              <label className="text-sm font-medium text-gray-500">Tipo de Caso</label>
              <p className="text-base text-gray-900 mt-1">
                {(() => {
                  const mat = caso.nombre_materia;
                  const cat = caso.nombre_categoria;
                  const sub = caso.nombre_subcategoria;
                  const amb = caso.nombre_ambito_legal;

                  const hasCat = cat && cat.toLowerCase() !== 'sin categoría' && cat.toLowerCase() !== 'n/a';
                  const hasSub = sub && sub.toLowerCase() !== 'sin subcategoría' && sub.toLowerCase() !== 'n/a';
                  const hasAmb = amb && amb.toLowerCase() !== 'sin ámbito' && amb.toLowerCase() !== 'n/a';

                  return (
                    `${mat || ''}${hasCat ? ` (${cat})` : ''}${hasSub ? ` - ${sub}` : ''}${hasAmb ? ` - ${amb}` : ''}`
                  );
                })()}
              </p>
            </div>
          )}
        </div>
        {caso.observaciones && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500">Observaciones</label>
            <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">{caso.observaciones}</p>
          </div>
        )}
      </div>

      {/* Información del Solicitante */}
      {caso.nombre_completo_solicitante && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Solicitante
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
              <p className="text-base mt-1">
                {caso.cedula ? (
                  <Link
                    href={`/dashboard/applicants/${caso.cedula}`}
                    className="text-primary hover:underline font-medium transition-colors"
                  >
                    {caso.nombre_completo_solicitante}
                  </Link>
                ) : (
                  <span className="text-gray-900">{caso.nombre_completo_solicitante}</span>
                )}
              </p>
            </div>
            {caso.cedula && (
              <div>
                <label className="text-sm font-medium text-gray-500">Cédula</label>
                <p className="text-base text-gray-900 mt-1">{caso.cedula}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Beneficiarios */}
      {caso.beneficiarios && caso.beneficiarios.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Beneficiarios ({caso.beneficiarios.length})
          </h3>
          <div className="space-y-4">
            {caso.beneficiarios.map((beneficiario) => {
              const edad = beneficiario.fecha_nac ? calculateAge(beneficiario.fecha_nac) : null;
              return (
                <div key={beneficiario.num_beneficiario} className="border border-gray-200 rounded-lg p-4 relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedBeneficiary(beneficiario);
                        setEditModalOpen(true);
                      }}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                      type="button"
                      title="Editar beneficiario"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(beneficiario.num_beneficiario, beneficiario.nombre_completo)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                      type="button"
                      title="Eliminar beneficiario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                      <p className="text-base text-gray-900 mt-1">{beneficiario.nombre_completo}</p>
                    </div>
                    {beneficiario.cedula && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Cédula</label>
                        <p className="text-base text-gray-900 mt-1">{beneficiario.cedula}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                      <p className="text-base text-gray-900 mt-1">
                        {beneficiario.fecha_nac ? formatDate(beneficiario.fecha_nac) : 'N/A'}
                        {edad !== null && ` (${edad} años)`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Sexo</label>
                      <p className="text-base text-gray-900 mt-1">{formatSexo(beneficiario.sexo)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tipo de Beneficiario</label>
                      <p className="text-base text-gray-900 mt-1">{beneficiario.tipo_beneficiario}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Parentesco</label>
                      <p className="text-base text-gray-900 mt-1">{beneficiario.parentesco}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(!caso.beneficiarios || caso.beneficiarios.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay beneficiarios registrados para este caso</p>
        </div>
      )}

      {/* Semestres de Actividad */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Semestres de Actividad ({semesters.length})
          </h3>
          <button
            onClick={handleOpenAddSemester}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
          >
            + Agregar Semestre
          </button>
        </div>

        {loadingSemesters ? (
          <p className="text-gray-500">Cargando semestres...</p>
        ) : (
          <div className="space-y-3">
            {semesters.length === 0 ? (
              <p className="text-gray-500 italic">No hay semestres asociados a este caso.</p>
            ) : (
              semesters.map((sem) => (
                <div key={sem.term} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">Semestre {sem.term}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(sem.fecha_inicio)} - {formatDate(sem.fecha_fin)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSemester(sem.term)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    title="Eliminar asociación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Agregar Semestre */}
      <Modal
        isOpen={addSemesterModalOpen}
        onClose={() => setAddSemesterModalOpen(false)}
        title="Asociar Semestre"
        size="sm"
      >
        <div className="p-6">
          <p className="mb-4 text-sm text-gray-600">
            Selecciona el semestre que deseas asociar a este caso.
          </p>

          <div className="mb-6">
            <Select
              label="Semestre"
              value={selectedSemesterToAdd}
              onChange={(e) => setSelectedSemesterToAdd(e.target.value)}
              options={availableSemesters.map(s => ({ value: s.term, label: s.term }))}
              placeholder="Seleccionar semestre..."
              disabled={isAddingSemester}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setAddSemesterModalOpen(false)}
              disabled={isAddingSemester}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleAddSemester}
              disabled={!selectedSemesterToAdd || isAddingSemester}
              isLoading={isAddingSemester}
            >
              Agregar
            </Button>
          </div>
        </div>
      </Modal>
      <EditBeneficiaryModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBeneficiary(null);
        }}
        idCaso={caso.id_caso}
        beneficiario={selectedBeneficiary}
        beneficiariosActuales={caso.beneficiarios || []}
        onSuccess={() => {
          router.refresh(); // Mantiene estado de server components actualizado
          if (onRefresh) onRefresh(); // Actualiza el estado local del cliente
        }}
      />
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBeneficiaryToDelete(null);
          setDeleteMotivo('');
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Beneficiario"
        message={`¿Estás seguro de que deseas eliminar al beneficiario ${beneficiaryToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        showMotive={true}
        motiveValue={deleteMotivo}
        onMotiveChange={setDeleteMotivo}
        motivePlaceholder="Describe el motivo de la eliminación..."
        motiveRequired={true}
      />

      <ConfirmModal
        isOpen={deleteSemesterConfirmOpen}
        onClose={() => {
          setDeleteSemesterConfirmOpen(false);
          setSemesterToDelete(null);
        }}
        onConfirm={confirmRemoveSemester}
        title="Eliminar Semestre"
        message={`¿Estás seguro de que deseas eliminar la asociación con el semestre ${semesterToDelete}?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
      />
    </div>
  );
}

