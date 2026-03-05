'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import GeneralInfoTab from '@/components/cases/tabs/GeneralInfoTab';
import TeamTab from '@/components/cases/tabs/TeamTab';
import ActionsHistoryTab from '@/components/cases/tabs/ActionsHistoryTab';
import AppointmentsTab from '@/components/cases/tabs/AppointmentsTab';
import StatusChangesTab from '@/components/cases/tabs/StatusChangesTab';
import DocumentsTab from '@/components/cases/tabs/DocumentsTab';
import { getCasoByIdAction, changeStatusAction, deleteCasoAction, updateCasoAction, uploadSoportesAction } from '@/app/actions/casos';
import { ESTATUS_CASO } from '@/lib/constants/status';
import DropdownMenu from '@/components/ui/navigation/DropdownMenu';
import AddDocumentModal from '@/components/cases/modals/AddDocumentModal';
import AssignTeamModal from '@/components/cases/modals/AssignTeamModal';
import AddActionModal from '@/components/cases/modals/AddActionModal';
import AddBeneficiaryModal from '@/components/cases/modals/AddBeneficiaryModal';
import ChangeStatusModal from '@/components/cases/modals/ChangeStatusModal';
import { AppointmentModal } from '@/components/appointmentModal/AppointmentModal';
import ActionMenu from '@/components/ui/ActionMenu';
import CaseFormModal from '@/components/forms/CaseFormModal';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';
import { descargarHistorialCasoAction } from '@/app/actions/reports';
import { generateCasoHistorialZip } from '@/lib/utils/case-history-pdf-generator';
import type { CasoHistorialData } from '@/lib/types/report-types';
import { ChevronDown, Plus, Pencil, RefreshCw, Download } from 'lucide-react';
import { getCurrentUserAction } from '@/app/actions/auth';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import DetailPageSkeleton from '@/components/ui/skeletons/DetailPageSkeleton';
import { logger } from '@/lib/utils/logger';

interface CaseDetailClientProps {
  id?: string;
}

export default function CaseDetailClient({ id: propId }: CaseDetailClientProps = {}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = propId || (params?.id as string);

  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAssignTeamModal, setShowAssignTeamModal] = useState(false);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [showAddBeneficiaryModal, setShowAddBeneficiaryModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRol, setUserRol] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Si viene el parámetro tab en la URL, usarlo como pestaña inicial
    const tabParam = searchParams.get('tab');
    const validTabs = ['general', 'equipo', 'acciones', 'citas', 'estatus', 'documentos'];
    return tabParam && validTabs.includes(tabParam) ? tabParam : 'general';
  });


  const fetchCaso = useCallback(async () => {
    const idCaso = parseInt(id, 10);
    if (isNaN(idCaso)) {
      setError('ID de caso inválido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getCasoByIdAction(idCaso);

      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar la información del caso');
      }

      if (result.data) {
        setCaso(result.data);
      } else {
        throw new Error('No se pudo obtener la información');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error fetching caso:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCaso();
    }
  }, [id, fetchCaso]);

  useEffect(() => {
    const loadUserRol = async () => {
      try {
        const result = await getCurrentUserAction();
        if (result.success && result.data) {
          setUserRol(result.data.rol);
        }
      } catch (err) {
        logger.error('Error al obtener rol del usuario:', err);
      }
    };
    loadUserRol();
  }, []);

  if (loading) {
    return <DetailPageSkeleton showBadge tabsCount={6} />;
  }

  if (error || !caso) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span>{error || 'No se encontró el caso'}</span>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    fetchCaso();
  };

  const handleDocumentUploaded = () => {
    setActiveTab('documentos');
    handleRefresh();
  };

  const handleEditCase = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteCase = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);

    try {
      const result = await deleteCasoAction(parseInt(id), deleteMotivo);
      if (result.success) {
        toast.success('Caso eliminado exitosamente');
        router.push('/dashboard/cases');
      } else {
        toast.error(result.error?.message || 'Error al eliminar el caso');
      }
    } catch (err) {
      toast.error('Error al eliminar el caso');
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmitEdit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Filtrar campos innecesarios que vienen del objeto 'caso'
      const updateData = {
        id_caso: data.id_caso,
        tramite: data.tramite,
        observaciones: data.observaciones,
        fecha_fin_caso: data.fecha_fin_caso,
        id_nucleo: data.id_nucleo,
        id_materia: data.id_materia,
        num_categoria: data.num_categoria ?? 0,
        num_subcategoria: data.num_subcategoria ?? 0,
        num_ambito_legal: data.num_ambito_legal,
        fecha_solicitud: data.fecha_solicitud,
        cedula: data.cedula,
      };

      const result = await updateCasoAction(parseInt(id), updateData);
      if (result.success) {
        toast.success('Caso actualizado exitosamente');
        setIsEditModalOpen(false);
        fetchCaso();
      } else {
        toast.error(result.error?.message || 'Error al actualizar el caso');
      }
    } catch (err) {
      toast.error('Error al actualizar el caso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadHistorial = async () => {
    try {
      const result = await descargarHistorialCasoAction(parseInt(id));
      if (result.success && result.data) {
        await generateCasoHistorialZip(result.data as CasoHistorialData);
      } else {
        toast.error(`Error al descargar el historial: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      logger.error('Error al descargar historial:', error);
      toast.error('Ocurrió un error al descargar el historial del caso');
    }
  };

  const handleDownloadRegistro = async () => {
    try {
      const { generateRegistroControlCasosPDF } = await import('@/lib/utils/case-registration-pdf-generator');
      await generateRegistroControlCasosPDF({
        caso,
        equipo: caso.equipo || [],
        beneficiarios: caso.beneficiarios || []
      });
    } catch (error) {
      logger.error('Error al generar registro:', error);
      toast.error('Error al generar el documento');
    }
  };

  const getStatusColor = (estatus: string | null) => {
    if (!estatus) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      'En proceso': 'bg-blue-100 text-blue-800',
      'Archivado': 'bg-gray-100 text-gray-800',
      'Entregado': 'bg-green-100 text-green-800',
      'Asesoría': 'bg-purple-100 text-purple-800',
    };
    return colors[estatus] || 'bg-gray-100 text-gray-800';
  };

  // Abre el modal para cambiar estatus
  const handleOpenStatusModal = () => {
    if (!caso) return;
    setShowChangeStatusModal(true);
  };

  // Confirma el cambio de estatus con el motivo y nuevo estatus
  const handleConfirmStatusChange = async (motivo: string, nuevoEstatus: string) => {
    if (!caso) return;

    setChangingStatus(true);
    try {
      const result = await changeStatusAction(caso.id_caso, nuevoEstatus, motivo);

      if (!result.success) {
        alert(result.error?.message || 'Error al cambiar el estatus');
        return;
      }

      // Cerrar modal
      setShowChangeStatusModal(false);

      // Recargar el caso para actualizar el estatus
      await fetchCaso();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar el estatus');
    } finally {
      setChangingStatus(false);
    }
  };

  const handleEditAppointment = (cita: any) => {
    // Convertir la cita al formato que espera el AppointmentModal (Appointment interface)
    const appointmentData = {
      id: `cita-${cita.num_cita}-${cita.id_caso}-${new Date(cita.fecha_encuentro).getTime()}`,
      title: `Cita #${cita.num_cita}`,
      date: cita.fecha_encuentro ? new Date(cita.fecha_encuentro) : new Date(),
      time: '00:00',
      caseId: cita.id_caso,
      caseDetail: `C-${cita.id_caso}`,
      client: '',
      location: '',
      orientation: cita.orientacion || '',
      attendingUsers: (cita.atenciones || []).map((a: any) => a.nombre_completo || `${a.nombres} ${a.apellidos}`).join(', '),
      attendingUsersList: (cita.atenciones || []).map((a: any) => ({
        id_usuario: a.id_usuario || a.cedula_usuario,
        nombres: a.nombres || '',
        apellidos: a.apellidos || '',
        nombre_completo: a.nombre_completo || `${a.nombres || ''} ${a.apellidos || ''}`,
        fecha_registro: a.fecha_registro || ''
      })),
      isMultiplePeople: (cita.atenciones || []).length > 1,
      nextAppointmentDate: cita.fecha_proxima_cita ? new Date(cita.fecha_proxima_cita).toISOString().split('T')[0] : null
    };

    setEditingAppointment(appointmentData);
    setShowAppointmentModal(true);
  };

  const handleAppointmentSaved = () => {
    setShowAppointmentModal(false);
    setEditingAppointment(null);
    fetchCaso(); // Recargar los datos
  };

  const codigoCaso = caso.id_caso.toString();
  const nombreSolicitante = caso.nombre_completo_solicitante || 'Caso sin solicitante';

  const tabs = [
    {
      id: 'general',
      label: 'Información General',
      content: <GeneralInfoTab caso={caso} onRefresh={fetchCaso} />,
    },
    {
      id: 'equipo',
      label: 'Equipo Asignado',
      content: <TeamTab equipo={caso.equipo} />,
    },
    {
      id: 'acciones',
      label: 'Historial de Acciones',
      content: <ActionsHistoryTab acciones={caso.acciones} onRefresh={fetchCaso} />,
    },
    {
      id: 'citas',
      label: 'Citas y Orientaciones',
      content: <AppointmentsTab
        citas={caso.citas}
        onRefresh={fetchCaso}
        onEditAppointment={handleEditAppointment}
      />,
    },
    {
      id: 'estatus',
      label: 'Cambios de Estatus',
      content: <StatusChangesTab cambiosEstatus={caso.cambiosEstatus} />,
    },
    {
      id: 'documentos',
      label: 'Soportes y Documentos',
      content: <DocumentsTab soportes={caso.soportes} onSoporteDeleted={handleRefresh} />,
    },
  ];

  const estatusOptions = [
    { value: ESTATUS_CASO.EN_PROCESO, label: ESTATUS_CASO.EN_PROCESO },
    { value: ESTATUS_CASO.ARCHIVADO, label: ESTATUS_CASO.ARCHIVADO },
    { value: ESTATUS_CASO.ENTREGADO, label: ESTATUS_CASO.ENTREGADO },
    { value: ESTATUS_CASO.ASESORIA, label: ESTATUS_CASO.ASESORIA },
  ].filter(opt => opt.value !== caso?.estatus);

  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Breadcrumbs
          items={[
            { label: 'Casos', href: '/dashboard/cases' },
            { label: codigoCaso }
          ]}
        />
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold dark:text-[var(--foreground)]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {codigoCaso}
          </h1>
          {caso.estatus && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caso.estatus)}`}>
              {caso.estatus}
            </span>
          )}
          <ActionMenu
            variant="vertical"
            onEdit={handleEditCase}
            onDelete={handleDeleteCase}
            customActions={[
              {
                label: (
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-gray-500 group-hover:text-yellow-600 transition-colors" />
                    <span className="group-hover:text-yellow-600 transition-colors">Descargar historial</span>
                  </div>
                ),
                onClick: handleDownloadHistorial
              },
              {
                label: (
                  <div className="flex items-center gap-2 text-wrap pr-1">
                    <Download className="w-4 h-4 text-gray-500 group-hover:text-yellow-600 transition-colors shrink-0" />
                    <span className="group-hover:text-yellow-600 transition-colors leading-tight">Descargar registro y control</span>
                  </div>
                ),
                onClick: handleDownloadRegistro
              }
            ]}
          />
        </div>

        <div className="w-full sm:w-auto pb-2 sm:pb-0 order-2 sm:order-none">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:flex-wrap sm:justify-end">
            {(() => {
              const isClosed = caso.estatus === 'Entregado' || caso.estatus === 'Archivado';
              const tooltipText = isClosed ? `No disponible: Caso ${caso.estatus}` : undefined;

              return (
                <>
                  {userRol && userRol !== 'Estudiante' && (
                    <div className={`relative group ${isClosed ? 'cursor-not-allowed' : ''}`}>
                      <button
                        onClick={() => {
                          if (isClosed) return;
                          setShowAssignTeamModal(true);
                        }}
                        disabled={isClosed}
                        className={`w-full sm:w-auto h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap transition-colors ${isClosed ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-primary-light'}`}
                      >
                        {caso.equipo && caso.equipo.length > 0 ? (
                          <Pencil className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#414040] dark:text-[var(--card-text-muted)] shrink-0" />
                        ) : (
                          <Plus className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#414040] dark:text-[var(--card-text-muted)] shrink-0" />
                        )}
                        <span className="text-xs sm:text-base text-center">
                          {caso.equipo && caso.equipo.length > 0 ? 'Modificar Equipo' : 'Asignar Equipo'}
                        </span>
                      </button>
                      {isClosed && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] border border-red-100 font-medium tracking-wide">
                          {tooltipText}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`relative group ${isClosed ? 'cursor-not-allowed' : ''}`}>
                    <button
                      onClick={() => {
                        if (isClosed) return;
                        setShowAddDocumentModal(true);
                      }}
                      disabled={isClosed}
                      className={`w-full sm:w-auto h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap transition-colors ${isClosed ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-primary-light'}`}
                    >
                      <Plus className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#414040] dark:text-[var(--card-text-muted)] shrink-0" />
                      <span className="text-xs sm:text-base text-center">Agregar Documento</span>
                    </button>
                    {isClosed && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] border border-red-100 font-medium tracking-wide">
                        {tooltipText}
                      </div>
                    )}
                  </div>

                  <div className={`relative group ${isClosed ? 'cursor-not-allowed' : ''}`}>
                    <button
                      onClick={() => {
                        if (isClosed) return;
                        setShowAddActionModal(true);
                      }}
                      disabled={isClosed}
                      className={`w-full sm:w-auto h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap transition-colors ${isClosed ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-primary-light'}`}
                    >
                      <Plus className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#414040] dark:text-[var(--card-text-muted)] shrink-0" />
                      <span className="text-xs sm:text-base text-center">Registrar Acción</span>
                    </button>
                    {isClosed && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] border border-red-100 font-medium tracking-wide">
                        {tooltipText}
                      </div>
                    )}
                  </div>

                  <div className={`relative group ${isClosed ? 'cursor-not-allowed' : ''}`}>
                    <button
                      onClick={() => {
                        if (isClosed) return;
                        setShowAddBeneficiaryModal(true);
                      }}
                      disabled={isClosed}
                      className={`w-full sm:w-auto h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap transition-colors ${isClosed ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-primary-light'}`}
                    >
                      <Plus className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#414040] dark:text-[var(--card-text-muted)] shrink-0" />
                      <span className="text-xs sm:text-base text-center">Agregar Beneficiario</span>
                    </button>
                    {isClosed && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] border border-red-100 font-medium tracking-wide">
                        {tooltipText}
                      </div>
                    )}
                  </div>

                  <div className="relative group col-span-2 sm:col-span-1">
                    <button
                      onClick={() => {
                        handleOpenStatusModal();
                      }}
                      className={`w-full h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap transition-colors cursor-pointer hover:bg-primary-light`}
                    >
                      <RefreshCw className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#414040] dark:text-[var(--card-text-muted)] shrink-0" />
                      <span className="text-xs sm:text-base text-center">Cambiar Estatus</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        <div className="w-full order-1 sm:order-none">
          {nombreSolicitante && (
            <p className="text-sm sm:text-base text-gray-500 dark:text-[var(--card-text-muted)] mb-2 sm:mb-0 flex items-center gap-1.5 flex-wrap">
              Solicitante:
              {caso.cedula ? (
                <>
                  <Link
                    href={`/dashboard/applicants/${caso.cedula}`}
                    className="text-primary hover:underline font-medium transition-colors"
                  >
                    {nombreSolicitante}
                  </Link>
                  <span className="text-gray-400 dark:text-gray-500">({caso.cedula})</span>
                </>
              ) : (
                <span>{nombreSolicitante}</span>
              )}
            </p>
          )}
        </div>
      </motion.div>

      <AddDocumentModal
        isOpen={showAddDocumentModal}
        onClose={() => setShowAddDocumentModal(false)}
        idCaso={caso.id_caso}
        onSuccess={handleDocumentUploaded}
      />

      <AssignTeamModal
        isOpen={showAssignTeamModal}
        onClose={() => setShowAssignTeamModal(false)}
        idCaso={caso.id_caso}
        equipoActual={caso.equipo}
        onSuccess={handleRefresh}
      />

      <AddActionModal
        isOpen={showAddActionModal}
        onClose={() => setShowAddActionModal(false)}
        idCaso={caso.id_caso}
        onSuccess={handleRefresh}
      />

      <AddBeneficiaryModal
        isOpen={showAddBeneficiaryModal}
        onClose={() => setShowAddBeneficiaryModal(false)}
        idCaso={caso.id_caso}
        beneficiariosActuales={caso.beneficiarios}
        onSuccess={handleRefresh}
      />

      {showAppointmentModal && (
        <AppointmentModal
          onClose={() => {
            setShowAppointmentModal(false);
            setEditingAppointment(null);
          }}
          onSave={handleAppointmentSaved}
          appointment={editingAppointment}
        />
      )}

      <ChangeStatusModal
        isOpen={showChangeStatusModal}
        onClose={() => setShowChangeStatusModal(false)}
        onConfirm={handleConfirmStatusChange}
        estatusActual={caso.estatus || ''}
        isSubmitting={changingStatus}
        estatusOptions={estatusOptions}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Tabs tabs={tabs} defaultTab={activeTab} onTabChange={setActiveTab} />
      </motion.div>
      <CaseFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
        isEditing={true}
        initialData={caso}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteMotivo('');
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar caso permanentemente"
        message={
          <div>
            <p className="mb-4 text-base text-foreground">
              ¿Estás seguro de que deseas eliminar el caso <strong>{codigoCaso}</strong>?
            </p>
            <p className="mb-6 text-red-500 font-semibold text-base dark:text-red-400">
              Esta acción es irreversible. Se eliminarán todas las referencias asociadas (citas, acciones, soportes, etc.).
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">
                Motivo de la eliminación
              </label>
              <textarea
                className={`
                  w-full p-4 rounded-lg border border-transparent bg-[var(--input-bg)]
                  focus:outline-none focus:ring-1 focus:ring-primary
                  text-base text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] resize-none
                  ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                rows={4}
                maxLength={250}
                value={deleteMotivo}
                onChange={e => setDeleteMotivo(e.target.value)}
                placeholder="Describe el motivo de la eliminación..."
                disabled={deleteLoading}
              />
              <div className="text-right text-xs text-[var(--card-text-muted)] mt-1">
                {deleteMotivo.length} / 250 caracteres
              </div>
            </div>
          </div>
        }
        confirmLabel={deleteLoading ? 'Eliminando...' : 'Eliminar'}
        cancelLabel="Cancelar"
        disabled={deleteLoading || !deleteMotivo.trim()}
        confirmVariant="danger"
      />
    </div>
  );
}