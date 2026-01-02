'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useParams, useRouter } from 'next/navigation';
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
import { getCasoByIdAction, changeStatusAction } from '@/app/actions/casos';
import { ESTATUS_CASO } from '@/lib/constants/status';
import DropdownMenu from '@/components/ui/navigation/DropdownMenu';
import AddDocumentModal from '@/components/cases/modals/AddDocumentModal';
import AssignTeamModal from '@/components/cases/modals/AssignTeamModal';
import AddActionModal from '@/components/cases/modals/AddActionModal';
import AddBeneficiaryModal from '@/components/cases/modals/AddBeneficiaryModal';
import { ChevronDown, Plus, Pencil } from 'lucide-react';
import { getCurrentUserAction } from '@/app/actions/auth';

export default function CaseDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAssignTeamModal, setShowAssignTeamModal] = useState(false);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [showAddBeneficiaryModal, setShowAddBeneficiaryModal] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [userRol, setUserRol] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('general');

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
      console.error('Error fetching caso:', err);
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
        console.error('Error al obtener rol del usuario:', err);
      }
    };
    loadUserRol();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Cargando información del caso...</div>
        </div>
      </div>
    );
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

  const handleStatusChange = async (nuevoEstatus: string) => {
    if (!caso) return;

    setChangingStatus(true);
    try {
      const result = await changeStatusAction(caso.id_caso, nuevoEstatus);

      if (!result.success) {
        alert(result.error?.message || 'Error al cambiar el estatus');
        return;
      }

      // Recargar el caso para actualizar el estatus
      await fetchCaso();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar el estatus');
    } finally {
      setChangingStatus(false);
    }
  };

  const codigoCaso = caso.id_caso.toString();
  const nombreSolicitante = caso.nombre_completo_solicitante || 'Caso sin solicitante';

  const tabs = [
    {
      id: 'general',
      label: 'Información General',
      content: <GeneralInfoTab caso={caso} />,
    },
    {
      id: 'equipo',
      label: 'Equipo Asignado',
      content: <TeamTab equipo={caso.equipo} />,
    },
    {
      id: 'acciones',
      label: 'Historial de Acciones',
      content: <ActionsHistoryTab acciones={caso.acciones} />,
    },
    {
      id: 'citas',
      label: 'Citas y Orientaciones',
      content: <AppointmentsTab citas={caso.citas} />,
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Breadcrumbs
          items={[
            { label: 'Casos', href: '/dashboard/cases' },
            { label: codigoCaso }
          ]}
        />
      </motion.div>

      <motion.div
        className="flex items-center justify-between mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {codigoCaso}
          </h1>
          {caso.estatus && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caso.estatus)}`}>
              {caso.estatus}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {userRol && userRol !== 'Estudiante' && (
            <button
              onClick={() => setShowAssignTeamModal(true)}
              className="h-10 cursor-pointer px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors"
            >
              {caso.equipo && caso.equipo.length > 0 ? (
                <Pencil className="w-[18px] h-[18px] text-[#414040]" />
              ) : (
                <Plus className="w-[18px] h-[18px] text-[#414040]" />
              )}
              <span className="text-base text-center">
                {caso.equipo && caso.equipo.length > 0 ? 'Modificar Equipo' : 'Asignar Equipo'}
              </span>
            </button>
          )}

          <button
            onClick={() => setShowAddDocumentModal(true)}
            className="h-10 cursor-pointer px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors"
          >
            <Plus className="w-[18px] h-[18px] text-[#414040]" />
            <span className="text-base text-center">Agregar Documento</span>
          </button>

          <button
            onClick={() => setShowAddActionModal(true)}
            className="h-10 cursor-pointer px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors"
          >
            <Plus className="w-[18px] h-[18px] text-[#414040]" />
            <span className="text-base text-center">Registrar Acción</span>
          </button>

          <button
            onClick={() => setShowAddBeneficiaryModal(true)}
            className="h-10 cursor-pointer px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors"
          >
            <Plus className="w-[18px] h-[18px] text-[#414040]" />
            <span className="text-base text-center">Agregar Beneficiario</span>
          </button>

          <DropdownMenu
            trigger={
              <button
                disabled={changingStatus}
                className="h-10 cursor-pointer px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-base text-center">Cambiar Estatus</span>
                <ChevronDown className="w-[18px] h-[18px] text-[#414040]" />
              </button>
            }
            align="left"
            menuClassName="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]"
          >
            {estatusOptions.length > 0 ? (
              estatusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No hay otros estatus disponibles
              </div>
            )}
          </DropdownMenu>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
      >
        {nombreSolicitante && (
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 flex items-center gap-1.5">
            Solicitante:
            {caso.cedula ? (
              <>
                <Link
                  href={`/dashboard/applicants/${caso.cedula}`}
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  {nombreSolicitante}
                </Link>
                <span className="text-gray-400">({caso.cedula})</span>
              </>
            ) : (
              <span>{nombreSolicitante}</span>
            )}
          </p>
        )}
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25, ease: 'easeOut' }}
      >
        <Tabs tabs={tabs} defaultTab={activeTab} onTabChange={setActiveTab} />
      </motion.div>
    </div>
  );
}

