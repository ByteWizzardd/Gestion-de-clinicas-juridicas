'use client';

import { useState, useEffect, useCallback, type ComponentProps } from 'react';
import { motion } from 'motion/react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PersonalInfoTab from '@/components/solicitantes/tabs/PersonalInfoTab';
import ContactInfoTab from '@/components/solicitantes/tabs/ContactInfoTab';
import SocioeconomicInfoTab from '@/components/solicitantes/tabs/SocioeconomicInfoTab';
import LocationHousingTab from '@/components/solicitantes/tabs/LocationHousingTab';
import CasesTab from '@/components/solicitantes/tabs/CasesTab';
import DetailPageSkeleton from '@/components/ui/skeletons/DetailPageSkeleton';
import ActionMenu from '@/components/ui/ActionMenu';
import { Download, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import { getCurrentUserAction } from '@/app/actions/auth';
import { updateSolicitanteAction, deleteSolicitanteAction } from '@/app/actions/solicitantes';
import { descargarFichaSolicitanteAction } from '@/app/actions/reports';
import { generateSolicitanteFichaZip } from '@/lib/utils/applicant-file-pdf-generator';
import type { SolicitanteFichaData } from '@/lib/types/report-types';
import ApplicantFormModal from '@/components/forms/ApplicantFormModal';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';

type GetSolicitanteByIdAction = typeof import('@/app/actions/solicitantes').getSolicitanteByIdAction;
type GetSolicitanteByIdResult = Awaited<ReturnType<GetSolicitanteByIdAction>>;
type Solicitante = NonNullable<GetSolicitanteByIdResult['data']>;
type CasesTabCaso = ComponentProps<typeof CasesTab>['casos'][number];

const toStringOrNull = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (value == null) return null;
  return String(value);
};

const toStringOrEmpty = (value: unknown): string => {
  const s = toStringOrNull(value);
  return s ?? '';
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toCasesTabCaso = (c: Solicitante['casos'][number]): CasesTabCaso => {
  const idCaso = toNumberOrNull((c as { id_caso?: unknown }).id_caso) ?? toNumberOrNull((c as { id?: unknown }).id) ?? 0;

  return {
    id_caso: idCaso,
    fecha_solicitud: toStringOrNull((c as { fecha_solicitud_str?: unknown }).fecha_solicitud_str ?? (c as { fecha_solicitud?: unknown }).fecha_solicitud),
    fecha_inicio_caso: toStringOrNull((c as { fecha_inicio_caso_str?: unknown }).fecha_inicio_caso_str ?? (c as { fecha_inicio_caso?: unknown }).fecha_inicio_caso),
    fecha_fin_caso: toStringOrNull((c as { fecha_fin_caso_str?: unknown }).fecha_fin_caso_str ?? (c as { fecha_fin_caso?: unknown }).fecha_fin_caso),
    tramite: toStringOrNull((c as { tramite?: unknown }).tramite),
    estatus: toStringOrNull((c as { estatus?: unknown }).estatus),
    cant_beneficiarios: toNumberOrNull((c as { cant_beneficiarios?: unknown }).cant_beneficiarios),
    observaciones: toStringOrNull((c as { observaciones?: unknown }).observaciones),
    nombre_nucleo: toStringOrNull((c as { nombre_nucleo?: unknown }).nombre_nucleo),
    nombre_materia: toStringOrNull((c as { nombre_materia?: unknown }).nombre_materia),
    nombre_categoria: toStringOrNull((c as { nombre_categoria?: unknown }).nombre_categoria),
    nombre_subcategoria: toStringOrNull((c as { nombre_subcategoria?: unknown }).nombre_subcategoria),
  };
};

export default function ApplicantDetailClient() {
  const params = useParams();
  const router = useRouter();
  const cedula = params.id as string;

  const [solicitante, setSolicitante] = useState<Solicitante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRol, setUserRol] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchSolicitante = useCallback(async () => {
    if (!cedula) {
      setError('Cédula no proporcionada');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { getSolicitanteByIdAction } = await import('@/app/actions/solicitantes');
      const result = await getSolicitanteByIdAction(cedula);

      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar la información del solicitante');
      }

      if (result.data) {
        setSolicitante(result.data);
      } else {
        throw new Error('No se pudo obtener la información');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching solicitante:', err);
    } finally {
      setLoading(false);
    }
  }, [cedula]);

  useEffect(() => {
    if (cedula) {
      void fetchSolicitante();
    }
  }, [cedula, fetchSolicitante]);

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

  const handleEditApplicant = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteApplicant = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cedula) return;
    setDeleteLoading(true);

    try {
      const result = await deleteSolicitanteAction(cedula, deleteMotivo);
      if (result.success) {
        toast.success('Solicitante eliminado exitosamente');
        router.push('/dashboard/applicants');
      } else {
        toast.error('Error al eliminar el solicitante');
      }
    } catch (err) {
      toast.error('Error al eliminar el solicitante');
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDownloadFicha = async () => {
    if (!cedula || !solicitante) return;
    try {
      const result = await descargarFichaSolicitanteAction(cedula);
      if (result.success && result.data) {
        await generateSolicitanteFichaZip(result.data as SolicitanteFichaData);
        toast.success(`Ficha de ${nombreCompleto} descargada correctamente`);
      } else {
        toast.error('Error al descargar la ficha');
      }
    } catch (error) {
      console.error('Error al descargar ficha:', error);
      toast.error('Ocurrió un error al descargar la ficha del solicitante');
    }
  };

  const handleSubmitEdit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const result = await updateSolicitanteAction(cedula, data);
      if (result.success) {
        toast.success('Solicitante actualizado exitosamente');
        setIsEditModalOpen(false);
        fetchSolicitante();
      } else {
        toast.error('Error al actualizar el solicitante');
      }
    } catch (err) {
      toast.error('Error al actualizar el solicitante');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <DetailPageSkeleton tabsCount={5} />;
  }

  if (error || !solicitante) {
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
          <span>{error || 'No se encontró el solicitante'}</span>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'personal',
      label: 'Información Personal',
      content: <PersonalInfoTab solicitante={solicitante} />,
    },
    {
      id: 'contacto',
      label: 'Información de Contacto',
      content: (
        <ContactInfoTab
          solicitante={{
            telefono_local: toStringOrNull(solicitante.telefono_local),
            telefono_celular: toStringOrEmpty(solicitante.telefono_celular),
            correo_electronico: toStringOrEmpty(solicitante.correo_electronico),
          }}
        />
      ),
    },
    {
      id: 'socioeconomica',
      label: 'Información Socioeconómica',
      content: (
        <SocioeconomicInfoTab
          solicitante={{
            nivel: (solicitante as any).nivel_educativo,
            anos_cursados: (solicitante as any).tipo_tiempo_estudio === 'Años' ? (solicitante as any).tiempo_estudio : null,
            semestres_cursados: (solicitante as any).tipo_tiempo_estudio === 'Semestres' ? (solicitante as any).tiempo_estudio : null,
            trimestres_cursados: (solicitante as any).tipo_tiempo_estudio === 'Trimestres' ? (solicitante as any).tiempo_estudio : null,
            condicion_actividad: (solicitante as any).nombre_actividad,
            buscando_trabajo: (solicitante as any).id_actividad === 0,
            condicion_trabajo: (solicitante as any).nombre_trabajo,
            cant_personas: (solicitante as any).cant_personas,
            cant_trabajadores: (solicitante as any).cant_trabajadores,
            cant_ninos: (solicitante as any).cant_ninos,
            cant_ninos_estudiando: (solicitante as any).cant_ninos_estudiando,
            jefe_hogar: (solicitante as any).jefe_hogar
          }}
        />
      ),
    },
    {
      id: 'ubicacion',
      label: 'Ubicación y Vivienda',
      content: (
        <LocationHousingTab
          solicitante={{
            nombre_estado: (solicitante as any).nombre_estado,
            nombre_municipio: (solicitante as any).nombre_municipio,
            nombre_parroquia: (solicitante as any).nombre_parroquia,
            direccion_habitacion: (solicitante as any).direccion_habitacion,
            tipo_vivienda: (solicitante as any).tipo_vivienda,
            cant_habitaciones: (solicitante as any).cant_habitaciones,
            cant_banos: (solicitante as any).cant_banos,
            material_piso: (solicitante as any).material_piso,
            material_paredes: (solicitante as any).material_paredes,
            material_techo: (solicitante as any).material_techo,
            agua_potable: (solicitante as any).agua_potable,
            eliminacion_aguas_n: (solicitante as any).eliminacion_aguas_n,
            aseo: (solicitante as any).aseo,
            artefactos_domesticos: (solicitante as any).artefactos_domesticos
          }}
        />
      ),
    },
    {
      id: 'casos',
      label: 'Casos Asociados',
      content: (
        <CasesTab
          cedulaSolicitante={solicitante.cedula}
          casos={(solicitante.casos ?? []).map(toCasesTabCaso)}
        />
      ),
    },
  ];

  const nombreCompleto = `${solicitante.nombres || ''} ${solicitante.apellidos || ''}`.trim() || 'Solicitante';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Breadcrumbs
          items={[
            { label: 'Solicitantes', href: '/dashboard/applicants' },
            { label: nombreCompleto }
          ]}
        />
      </motion.div>

      <div className="flex items-center gap-3 mb-2">
        <motion.h1
          className="text-2xl sm:text-3xl lg:text-4xl font-semibold"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {nombreCompleto}
        </motion.h1>
        <ActionMenu
          variant="vertical"
          onEdit={handleEditApplicant}
          onDelete={handleDeleteApplicant}
          customActions={[
            {
              label: (
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-gray-500 group-hover:text-yellow-600 transition-colors" />
                  <span className="group-hover:text-yellow-600 transition-colors">Descargar ficha</span>
                </div>
              ),
              onClick: handleDownloadFicha
            }
          ]}
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {solicitante.cedula && (
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
            Cédula: {solicitante.cedula}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Tabs tabs={tabs} defaultTab="personal" />
      </motion.div>

      <ApplicantFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
        initialData={solicitante}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteMotivo('');
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Solicitante permanentemente"
        message={
          <div>
            <p className="mb-4 text-base text-foreground">
              ¿Estás seguro de que deseas eliminar al solicitante <strong>{nombreCompleto}</strong>?
            </p>
            <p className="mb-6 text-red-600 font-semibold text-base">
              Esta acción es irreversible y eliminará todos los datos asociados.
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-1">
                Motivo de la eliminación
              </label>
              <textarea
                className={`
                  w-full p-4 rounded-lg border bg-[#E5E7EB] border-transparent
                  focus:outline-none focus:ring-1 focus:ring-primary
                  text-base placeholder:text-[#717171] resize-none
                  ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                rows={4}
                maxLength={250}
                value={deleteMotivo}
                onChange={e => setDeleteMotivo(e.target.value)}
                placeholder="Describe el motivo de la eliminación..."
                disabled={deleteLoading}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
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

