'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import CaseTools from '@/components/CaseTools/CaseTools';
import Table from '@/components/Table/Table';
import ApplicantFormModal from '@/components/forms/ApplicantFormModal';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';
import {
  getSolicitantesAction,
  getSolicitantesByNucleoAction,
  getSolicitantesByEstadoCivilAction,
  getSolicitantesByNacionalidadAction,
} from '@/app/actions/solicitantes';
import { descargarFichaSolicitanteAction } from '@/app/actions/reports';
import { generateSolicitanteFichaZip } from '@/lib/utils/applicant-file-pdf-generator';
import { useToast } from '@/components/ui/feedback/ToastProvider';

interface Solicitante {
  cedula: string;
  nombre_completo: string;
  telefono_celular: string;
  nucleo: string | null;
  fecha_solicitud: string | null;
  estado_civil?: string | null;
  nacionalidad?: string | null;
}

interface ApplicantsClientProps {
  initialSolicitantes: Solicitante[];
  initialNucleos: Array<{ id_nucleo: number; nombre_nucleo: string }>;
}

export default function ApplicantsClient({
  initialSolicitantes,
  initialNucleos,
}: ApplicantsClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>(initialSolicitantes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<unknown | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registeredCedula, setRegisteredCedula] = useState<{ tipo: string; numero: string } | null>(null);
  const [registeredNombre, setRegisteredNombre] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [nucleoFilter, setNucleoFilter] = useState('');
  const [estadoCivilFilter, setEstadoCivilFilter] = useState('');
  const [nacionalidadFilter, setNacionalidadFilter] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Solicitante | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Preparar opciones de núcleos
  const nucleoOptions = useMemo(() => {
    const nucleos = new Set<string>();
    initialSolicitantes.forEach(s => {
      if (s.nucleo) nucleos.add(s.nucleo);
    });
    initialNucleos.forEach(n => {
      if (n.nombre_nucleo) {
        nucleos.add(n.nombre_nucleo);
      }
    });
    return Array.from(nucleos).map(nucleo => ({
      value: nucleo,
      label: nucleo
    }));
  }, [initialSolicitantes, initialNucleos]);

  const normalizeRowToSolicitante = (row: unknown): Solicitante => {
    const rec = (row ?? {}) as Record<string, unknown>;

    const cedula = typeof rec.cedula === 'string' ? rec.cedula : '';
    const nombreCompleto =
      typeof rec.nombre_completo === 'string'
        ? rec.nombre_completo
        : `${typeof rec.nombres === 'string' ? rec.nombres : ''} ${typeof rec.apellidos === 'string' ? rec.apellidos : ''}`.trim();

    const telefonoCelular = typeof rec.telefono_celular === 'string' ? rec.telefono_celular : '';
    const nucleo = typeof rec.nucleo === 'string' ? rec.nucleo : null;
    const fechaSolicitud = typeof rec.fecha_solicitud === 'string' ? rec.fecha_solicitud : null;

    const estadoCivil = typeof rec.estado_civil === 'string' ? rec.estado_civil : null;
    const nacionalidad = typeof rec.nacionalidad === 'string' ? rec.nacionalidad : null;

    return {
      cedula,
      nombre_completo: nombreCompleto,
      telefono_celular: telefonoCelular,
      nucleo,
      fecha_solicitud: fechaSolicitud,
      estado_civil: estadoCivil,
      nacionalidad,
    };
  };

  const applyServerFilters = async (filters: {
    nucleo: string;
    estadoCivil: string;
    nacionalidad: string;
  }) => {
    setIsFiltering(true);
    try {
      // 1) Elegir el filtro "principal" que se hace en backend.
      // 2) Si hay otros filtros seleccionados, se aplican sobre el resultado (ya reducido).
      let result:
        | Awaited<ReturnType<typeof getSolicitantesAction>>
        | Awaited<ReturnType<typeof getSolicitantesByNucleoAction>>
        | Awaited<ReturnType<typeof getSolicitantesByEstadoCivilAction>>
        | Awaited<ReturnType<typeof getSolicitantesByNacionalidadAction>>;

      if (filters.nucleo) {
        result = await getSolicitantesByNucleoAction(filters.nucleo);
      } else if (filters.estadoCivil) {
        result = await getSolicitantesByEstadoCivilAction(filters.estadoCivil);
      } else if (filters.nacionalidad) {
        result = await getSolicitantesByNacionalidadAction(filters.nacionalidad);
      } else {
        result = await getSolicitantesAction();
      }

      if (!result.success || !result.data) {
        toast.error(result.error?.message || 'No se pudieron cargar los solicitantes');
        return;
      }

      let rows = (result.data as unknown[]).map(normalizeRowToSolicitante);

      // Aplicar filtros secundarios sobre el conjunto ya reducido.
      if (filters.estadoCivil) {
        rows = rows.filter((r) => (r.estado_civil ?? '') === filters.estadoCivil);
      }
      if (filters.nacionalidad) {
        rows = rows.filter((r) => (r.nacionalidad ?? '') === filters.nacionalidad);
      }

      setSolicitantes(rows);
    } catch (e) {
      console.error(e);
      toast.error('Ocurrió un error al aplicar el filtro');
    } finally {
      setIsFiltering(false);
    }
  };

  const handleNucleoChange = async (value: string) => {
    setNucleoFilter(value);
    await applyServerFilters({ nucleo: value, estadoCivil: estadoCivilFilter, nacionalidad: nacionalidadFilter });
  };

  const handleEstadoCivilChange = async (value: string) => {
    setEstadoCivilFilter(value);
    await applyServerFilters({ nucleo: nucleoFilter, estadoCivil: value, nacionalidad: nacionalidadFilter });
  };

  const handleNacionalidadChange = async (value: string) => {
    setNacionalidadFilter(value);
    await applyServerFilters({ nucleo: nucleoFilter, estadoCivil: estadoCivilFilter, nacionalidad: value });
  };

  const handleClearApplicantFilters = async () => {
    setNucleoFilter('');
    setEstadoCivilFilter('');
    setNacionalidadFilter('');
    await applyServerFilters({ nucleo: '', estadoCivil: '', nacionalidad: '' });
  };

  // Función para normalizar texto removiendo acentos
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Filtrar solicitantes
  const filteredSolicitantes = useMemo(() => {
    if (!searchValue && !nucleoFilter) {
      return solicitantes;
    }

    return solicitantes.filter((solicitante) => {
      const normalizedSearch = normalizeText(searchValue);
      const nucleoDisplay = solicitante.nucleo || 'Sin núcleo';
      const matchesSearch =
        !searchValue ||
        solicitante.cedula.includes(searchValue) ||
        normalizeText(solicitante.nombre_completo || '').includes(normalizedSearch) ||
        normalizeText(solicitante.telefono_celular || '').includes(normalizedSearch) ||
        normalizeText(nucleoDisplay).includes(normalizedSearch);

      const matchesNucleo = !nucleoFilter || solicitante.nucleo === nucleoFilter;

      return matchesSearch && matchesNucleo;
    });
  }, [solicitantes, searchValue, nucleoFilter]);

  const handleView = (data: Record<string, unknown>) => {
    const solicitante = data as unknown as Solicitante;
    router.push(`/dashboard/applicants/${solicitante.cedula}`);
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    const solicitante = data as unknown as Solicitante;
    try {
      const { getSolicitanteByIdAction } = await import('@/app/actions/solicitantes');
      const result = await getSolicitanteByIdAction(solicitante.cedula);

      if (result.success && result.data) {
        setSelectedApplicant(result.data);
        setIsModalOpen(true);
      } else {
        toast.error('No se pudo cargar la información completa del solicitante.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Ocurrió un error al cargar los datos.');
    }
  };

  const handleDelete = (data: Record<string, unknown>) => {
    const solicitante = data as unknown as Solicitante;
    setItemToDelete(solicitante);
    setDeleteMotivo('');
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (motivo?: string) => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const { deleteSolicitanteAction } = await import('@/app/actions/solicitantes');
      const result = await deleteSolicitanteAction(itemToDelete.cedula, motivo || 'Sin motivo especificado');

      if (result.success) {
        toast.success(`Solicitante ${itemToDelete.nombre_completo} eliminado correctamente`);
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        setDeleteMotivo('');
        await handleRefresh();
      } else {
        toast.error(getErrorMessage(result.error) || 'Error desconocido', 'Error al eliminar');
      }
    } catch (e) {
      console.error(e);
      toast.error('Ocurrió un error al intentar eliminar el solicitante');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    await applyServerFilters({ nucleo: nucleoFilter, estadoCivil: estadoCivilFilter, nacionalidad: nacionalidadFilter });
  };

  const handleDownloadFicha = async (data: Record<string, unknown>) => {
    const solicitante = data as unknown as Solicitante;
    try {
      const result = await descargarFichaSolicitanteAction(solicitante.cedula);

      if (result.success && result.data) {
        if (
          result.data &&
          typeof result.data === 'object' &&
          'solicitante' in result.data
        ) {
          await generateSolicitanteFichaZip(result.data as import('@/lib/types/report-types').SolicitanteFichaData);
        } else {
          toast.error('Los datos de la ficha del solicitante están incompletos.', 'Error al descargar la ficha');
        }
        toast.success(`Ficha de ${solicitante.nombre_completo} descargada correctamente`);
      } else {
        toast.error(result.error || 'Error desconocido', 'Error al descargar la ficha');
      }
    } catch (error) {
      console.error('Error al descargar ficha:', error);
      toast.error('Ocurrió un error al descargar la ficha del solicitante');
    }
  };

  return (
    <>
      <motion.div
        className="mb-4 md:mb-6 mt-4"
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
      >
        <h1 className="text-4xl m-3 font-semibold font-primary">Solicitantes</h1>
        <p className="mb-6 ml-3">Listado y búsqueda de todas las personas atendidas.</p>
      </motion.div>
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
      >
        <CaseTools
          addLabel="Añadir Solicitante"
          onAddClick={() => {
            setSelectedApplicant(null);
            setIsModalOpen(true);
          }}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
           searchPlaceholder="Buscar solicitantes..."
          nucleoFilter={nucleoFilter}
          onNucleoChange={handleNucleoChange}
          nucleoOptions={nucleoOptions}
          estadoCivilFilter={estadoCivilFilter}
          onEstadoCivilChange={handleEstadoCivilChange}
          nacionalidadFilter={nacionalidadFilter}
          onNacionalidadChange={handleNacionalidadChange}
          onClearFilters={handleClearApplicantFilters}
        />
      </motion.div>
      <div className="mt-10"></div>

      {isFiltering && (
        <div className="px-3 py-2 text-sm text-gray-500">Cargando solicitantes...</div>
      )}

      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
      >
        <Table
          data={filteredSolicitantes.map((s) => ({
            cedula: s.cedula,
            nombre_completo: s.nombre_completo,
            telefono_celular: s.telefono_celular,
            nucleo: s.nucleo || 'Sin núcleo',
            fecha_solicitud: s.fecha_solicitud || 'N/A',
          }))}
          columns={["Cédula", "Nombre Completo", "Teléfono Celular", "Núcleo", "Fecha Solicitud"]}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actions={[
            {
              label: (
                <>
                  <Download className="w-4 h-4 text-gray-500 group-hover:text-yellow-600 transition-colors" />
                  Descargar ficha de solicitante
                </>
              ),
              onClick: handleDownloadFicha
            }
          ]}
        />
      </motion.div>

      <ApplicantFormModal
        isOpen={isModalOpen && !showConfirmModal}
        initialData={selectedApplicant}
        onClose={() => {
          setIsModalOpen(false);
          setShowConfirmModal(false);
          setRegisteredCedula(null);
          setRegisteredNombre('');
          setSelectedApplicant(null);
        }}
        onSubmit={async (data: unknown) => {
          const solicitante = extractSolicitanteFromSubmit(data);
          if (solicitante && solicitante.cedula) {
            const cedulaCompleta = String(solicitante.cedula);
            const tipo = cedulaCompleta.charAt(0);
            // Extraer solo los números, eliminando guiones y cualquier otro carácter
            const numero = cedulaCompleta.substring(1).replace(/[^0-9]/g, '');
            setRegisteredCedula({ tipo, numero });
            const nombres = typeof solicitante.nombres === 'string' ? solicitante.nombres : '';
            const apellidos = typeof solicitante.apellidos === 'string' ? solicitante.apellidos : '';
            setRegisteredNombre(nombres && apellidos
              ? `${nombres} ${apellidos}`
              : '');
          }

          await handleRefresh();
          setIsModalOpen(false);

          if (!selectedApplicant) {
            setShowConfirmModal(true);
          } else {
            setSelectedApplicant(null);
            setRegisteredCedula(null);
            setRegisteredNombre('');
          }
        }}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setRegisteredCedula(null);
          setRegisteredNombre('');
        }}
        onConfirm={() => {
          setShowConfirmModal(false);
          if (registeredCedula) {
            router.push(`/dashboard/cases?cedula=${registeredCedula.tipo}${registeredCedula.numero}&cedulaTipo=${registeredCedula.tipo}`);
          }
          setRegisteredCedula(null);
          setRegisteredNombre('');
        }}
        title="¿Asociar caso al solicitante?"
        message={`¿Deseas asociar un caso a ${registeredNombre}?`}
        confirmLabel="Sí, asociar caso"
        cancelLabel="No, cerrar"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
          setDeleteMotivo('');
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar solicitante"
        message={
          <div className="space-y-4">
            <p>
              ¿Estás seguro de que deseas eliminar al solicitante <strong>{itemToDelete?.nombre_completo}</strong>?
            </p>
            <p className="text-red-600 font-semibold">
              Esta acción eliminará todos los datos asociados al solicitante y es irreversible.
            </p>
          </div>
        }
        confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
        cancelLabel="Cancelar"
        confirmVariant="danger"
        showMotive={true}
        motiveValue={deleteMotivo}
        onMotiveChange={setDeleteMotivo}
        motivePlaceholder="Indique el motivo de la eliminación (ej. Error en registro, duplicado...)"
        disabled={isDeleting}
      />
    </>
  );
}

function extractSolicitanteFromSubmit(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== 'object') return null;
  const solicitante = (data as Record<string, unknown>).solicitante;
  if (!solicitante || typeof solicitante !== 'object') return null;
  return solicitante as Record<string, unknown>;
}

function getErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const msg = (error as Record<string, unknown>).message;
  return typeof msg === 'string' ? msg : null;
}

