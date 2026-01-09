'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import CaseTools from '@/components/CaseTools/CaseTools';
import Table from '@/components/Table/Table';
import CaseFormModal from '@/components/forms/CaseFormModal';
import Spinner from '@/components/ui/feedback/Spinner';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';
import { ESTATUS_CASO, TRAMITES } from '@/lib/constants/status';
import { getCasosAction, getCasosByUsuarioAction, deleteCasoAction } from '@/app/actions/casos';
import { createCasoAction, updateCasoAction, uploadSoportesAction } from '@/app/actions/casos';
import { getMateriasAction } from '@/app/actions/materias';
import { descargarHistorialCasoAction } from '@/app/actions/reports';
import { generateCasoHistorialPDF } from '@/lib/utils/pdf-generator-react';

interface Caso {
  id_caso: number;
  fecha_inicio_caso: string;
  fecha_fin_caso: string | null;
  fecha_solicitud: string;
  tramite: string;
  estatus: string;
  cant_beneficiarios: number;
  observaciones: string;
  id_nucleo: number;
  id_materia: number;
  num_categoria: number;
  num_subcategoria: number;
  num_ambito_legal: number;
  cedula: string;
  nombre_completo_solicitante: string;
  nombres_solicitante: string;
  apellidos_solicitante: string;
  nombre_nucleo: string;
  nombre_materia: string;
  nombre_categoria: string;
  nombre_subcategoria: string;
  nombre_responsable: string | null;
}

interface TableRow extends Record<string, unknown> {
  codigo: string;
  solicitante: string;
  materia: string;
  estatus: string;
  responsable: string;
}

interface CasesClientProps {
  initialCasos: Caso[];
}

export default function CasesClient({ initialCasos }: CasesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [casos, setCasos] = useState<Caso[]>(initialCasos);
  const [allCasos, setAllCasos] = useState<Caso[]>(initialCasos); // Cache para todos los casos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [nucleoFilter, setNucleoFilter] = useState('');
  const [tramiteFilter, setTramiteFilter] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('');
  const [casosAsignadosFilter, setCasosAsignadosFilter] = useState(false);
  const [materias, setMaterias] = useState<{ id_materia: number; nombre_materia: string }[]>([]);
  const [materiaFilter, setMateriaFilter] = useState('');
  const [initialCedula, setInitialCedula] = useState<string>('');
  const [initialCedulaTipo, setInitialCedulaTipo] = useState<string>('V');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [casoToDelete, setCasoToDelete] = useState<{ id_caso: number; codigo: string; solicitante: string } | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State for editing
  const [editingCase, setEditingCase] = useState<Caso | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Cargar materias
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

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const estatusOptions = [
    { value: ESTATUS_CASO.EN_PROCESO, label: ESTATUS_CASO.EN_PROCESO },
    { value: ESTATUS_CASO.ARCHIVADO, label: ESTATUS_CASO.ARCHIVADO },
    { value: ESTATUS_CASO.ENTREGADO, label: ESTATUS_CASO.ENTREGADO },
    { value: ESTATUS_CASO.ASESORIA, label: ESTATUS_CASO.ASESORIA },
  ];

  const tramiteOptions = [
    { value: TRAMITES.ASESORIA, label: TRAMITES.ASESORIA },
    { value: TRAMITES.CONCILIACION_MEDIACION, label: TRAMITES.CONCILIACION_MEDIACION },
    { value: TRAMITES.REDACCION_DOCUMENTOS, label: TRAMITES.REDACCION_DOCUMENTOS },
    { value: TRAMITES.ASISTENCIA_JUDICIAL, label: TRAMITES.ASISTENCIA_JUDICIAL },
  ];

  const fetchCasos = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCasosAction();
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar los casos');
      }
      if (result.data) {
        setCasos(result.data as Caso[]);
        setAllCasos(result.data as Caso[]); // Actualizar cache de todos los casos
      } else {
        setCasos([]);
        setAllCasos([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCasosAsignadosChange = async (checked: boolean) => {
    setCasosAsignadosFilter(checked);
    setLoading(true);
    try {
      if (checked) {
        // Cargar casos asignados al usuario
        const result = await getCasosByUsuarioAction();
        if (result.success && result.data) {
          setCasos(result.data as Caso[]);
        } else {
          // Si falla o no hay datos, mostrar lista vacía o manejar error
          console.error('Error cargando casos asignados:', result.error);
          setCasos([]);
        }
      } else {
        // Restaurar todos los casos (usando cache local para velocidad)
        setCasos(allCasos);
      }
    } catch (error) {
      console.error('Error al cambiar filtro de asignación:', error);
    } finally {
      setLoading(false);
    }
  };

  // Leer parámetros de URL para abrir modal con cédula prellenada
  useEffect(() => {
    const cedula = searchParams.get('cedula');
    const cedulaTipo = searchParams.get('cedulaTipo');

    if (cedula && cedulaTipo) {
      // Extraer solo los números, eliminando guiones y cualquier otro carácter
      let cedulaNumero = cedula.startsWith(cedulaTipo) ? cedula.substring(cedulaTipo.length) : cedula;
      cedulaNumero = cedulaNumero.replace(/[^0-9]/g, '');
      setInitialCedula(cedulaNumero);
      setInitialCedulaTipo(cedulaTipo);
      setIsModalOpen(true);
      router.replace('/dashboard/cases');
    }
  }, [searchParams, router]);

  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const filteredCasos = useMemo(() => {
    if (!searchValue && !nucleoFilter && !tramiteFilter && !estatusFilter && !casosAsignadosFilter && !materiaFilter) {
      return casos;
    }

    return casos.filter((caso) => {
      const normalizedSearch = normalizeText(searchValue);

      // Buscar en todos los campos visibles en la tabla
      const responsableDisplay = caso.nombre_responsable || 'Sin asignar';
      const matchesSearch =
        !searchValue ||
        // Código (id_caso)
        caso.id_caso.toString().includes(searchValue) ||
        // Solicitante (cedula y nombre completo)
        caso.cedula.includes(searchValue) ||
        normalizeText(caso.nombre_completo_solicitante || '').includes(normalizedSearch) ||
        normalizeText(caso.nombres_solicitante || '').includes(normalizedSearch) ||
        normalizeText(caso.apellidos_solicitante || '').includes(normalizedSearch) ||
        // Materia
        normalizeText(caso.nombre_materia || '').includes(normalizedSearch) ||
        normalizeText(caso.tramite || '').includes(normalizedSearch) ||
        normalizeText(caso.nombre_categoria || '').includes(normalizedSearch) ||
        normalizeText(caso.nombre_subcategoria || '').includes(normalizedSearch) ||
        // Estatus
        normalizeText(caso.estatus || '').includes(normalizedSearch) ||
        // Responsable (incluye "Sin asignar" cuando es null)
        normalizeText(responsableDisplay).includes(normalizedSearch) ||
        // Núcleo
        normalizeText(caso.nombre_nucleo || '').includes(normalizedSearch);

      const matchesNucleo = !nucleoFilter || caso.id_nucleo.toString() === nucleoFilter;
      const matchesTramite = !tramiteFilter || caso.tramite === tramiteFilter;
      const matchesEstatus = !estatusFilter || caso.estatus === estatusFilter;
      const matchesMateria = !materiaFilter || (caso.id_materia && String(caso.id_materia) === materiaFilter);

      return matchesSearch && matchesNucleo && matchesTramite && matchesEstatus && matchesMateria;
    });
  }, [casos, searchValue, nucleoFilter, tramiteFilter, estatusFilter, casosAsignadosFilter, materiaFilter]);

  const handleView = (data: Record<string, unknown>) => {
    const caso = data as TableRow;
    router.push(`/dashboard/cases/${caso.codigo}`);
  };

  const handleEdit = (data: Record<string, unknown>) => {
    const caso = data as TableRow;
    const fullCase = filteredCasos.find(c => c.id_caso.toString() === caso.codigo);
    if (fullCase) {
      setEditingCase(fullCase);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (data: Record<string, unknown>) => {
    const caso = data as TableRow;
    const casoCompleto = casos.find(c => c.id_caso.toString() === caso.codigo);
    if (casoCompleto) {
      setCasoToDelete({
        id_caso: casoCompleto.id_caso,
        codigo: caso.codigo,
        solicitante: casoCompleto.nombre_completo_solicitante || casoCompleto.cedula,
      });
      setShowConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!casoToDelete) return;
    setDeleteLoading(true);

    const result = await deleteCasoAction(
      casoToDelete.id_caso,
      deleteMotivo
    );

    setDeleteLoading(false);

    if (!result.success) {
      alert(result.error?.message || 'Error al eliminar caso');
      return;
    }

    // Actualizar la lista de casos
    setCasos((prev) => prev.filter(c => c.id_caso !== casoToDelete.id_caso));
    setAllCasos((prev) => prev.filter(c => c.id_caso !== casoToDelete.id_caso));
    setShowConfirm(false);
    setCasoToDelete(null);
    setDeleteMotivo('');
  };

  const handleAddCase = () => {
    setEditingCase(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCase(null);
  };

  const handleSubmitCase = async (data: unknown) => {
    try {
      const caseData = data as any;
      const archivos = Array.isArray(caseData.archivos) ? caseData.archivos : [];

      if (editingCase) {
        // Lógica de Actualización
        const updateData = {
          id_caso: caseData.id_caso,
          tramite: caseData.tramite,
          observaciones: caseData.observaciones,
          fecha_fin_caso: caseData.fecha_fin_caso,
          id_nucleo: caseData.id_nucleo,
          id_materia: caseData.id_materia,
          num_categoria: caseData.num_categoria ?? 0,
          num_subcategoria: caseData.num_subcategoria ?? 0,
          num_ambito_legal: caseData.num_ambito_legal,
          fecha_solicitud: caseData.fecha_solicitud,
        };

        const result = await updateCasoAction(caseData.id_caso, updateData);

        if (!result.success) {
          const errorMessage = result.error?.message || 'Error al actualizar el caso';
          alert(`Error: ${errorMessage}`);
          return;
        }

        // Subir archivos si hay nuevos
        if (archivos.length > 0) {
          const formData = new FormData();
          archivos.forEach((archivo: File) => {
            formData.append('archivos', archivo);
          });

          try {
            const uploadResult = await uploadSoportesAction(Number(caseData.id_caso), formData);
            if (!uploadResult.success) {
              alert(`Caso actualizado, pero error al subir archivos: ${uploadResult.error?.message}`);
            }
          } catch (uploadErr) {
            alert('Caso actualizado, pero error al subir archivos');
          }
        }

        alert('Caso actualizado exitosamente');
        setIsModalOpen(false);
        setEditingCase(null);
        fetchCasos();
        return;
      }

      // Lógica de Creación (existente)
      const casoDataSinArchivos = {
        fecha_solicitud: caseData.fecha_solicitud,
        fecha_inicio_caso: caseData.fecha_inicio_caso,
        cedula: caseData.cedula,
        id_materia: caseData.id_materia,
        num_categoria: caseData.num_categoria ?? 0,
        num_subcategoria: caseData.num_subcategoria ?? 0,
        num_ambito_legal: caseData.num_ambito_legal,
        tramite: caseData.tramite,
        estatus: caseData.estatus,
        id_nucleo: caseData.id_nucleo,
        observaciones: caseData.observaciones,
      };

      const result = await createCasoAction(casoDataSinArchivos);

      if (!result.success) {
        const errorMessage = result.error?.message || 'Error al crear el caso';
        const errorCode = result.error?.code || 'UNKNOWN_ERROR';
        const errorFields = result.error?.fields;

        if (errorFields) {
          const fieldErrors = Object.entries(errorFields)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          alert(`Error de validación:\n${fieldErrors}`);
        } else {
          alert(`Error: ${errorMessage}\nCódigo: ${errorCode}`);
        }
        return;
      }

      if (archivos.length > 0 && result.success && result.data) {
        const idCaso = (result.data as any).id_caso;

        if (!idCaso || isNaN(Number(idCaso))) {
          alert('Caso creado exitosamente, pero no se pudo obtener el ID del caso para subir los archivos');
          setIsModalOpen(false);
          fetchCasos();
          return;
        }

        const formData = new FormData();
        archivos.forEach((archivo: File) => {
          formData.append('archivos', archivo);
        });

        try {
          const uploadResult = await uploadSoportesAction(Number(idCaso), formData);

          if (!uploadResult.success) {
            alert(`Caso creado exitosamente, pero hubo un error al subir los archivos: ${uploadResult.error?.message || 'Error desconocido'}`);
          }
        } catch (uploadErr) {
          alert('Caso creado exitosamente, pero hubo un error al subir los archivos');
        }
      }

      alert('Caso registrado exitosamente');
      setIsModalOpen(false);
      fetchCasos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error al procesar el caso: ${errorMessage}`);
    }
  };

  const handleDownloadHistorial = async (data: Record<string, unknown>) => {
    const caso = data as TableRow;
    const idCaso = parseInt(caso.codigo);
    try {
      const result = await descargarHistorialCasoAction(idCaso);

      if (result.success && result.data) {
        await generateCasoHistorialPDF(result.data);
      } else {
        alert(`Error al descargar el historial: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al descargar historial:', error);
      alert(`Ocurrió un error al descargar el historial del caso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
        <h1 className="text-4xl m-3 font-semibold font-primary">Casos</h1>
        <p className="mb-6 ml-3">Listado y gestión de todos los casos registrados.</p>
      </motion.div>
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
      >
        <CaseTools
          addLabel="Añadir Caso"
          onAddClick={handleAddCase}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          nucleoFilter={nucleoFilter}
          onNucleoChange={setNucleoFilter}
          materiaFilter={materiaFilter}
          onMateriaChange={setMateriaFilter}
          materias={materias}
          tramiteFilter={tramiteFilter}
          onTramiteChange={setTramiteFilter}
          tramiteOptions={tramiteOptions}
          estatusFilter={estatusFilter}
          onEstatusChange={setEstatusFilter}
          estatusOptions={estatusOptions}
          casosAsignadosFilter={casosAsignadosFilter}
          onCasosAsignadosChange={handleCasosAsignadosChange}
          showCasosAsignados={true}
        />
      </motion.div>
      <div className="mt-10"></div>

      {loading && (
        <div className="flex flex-col justify-center items-center py-12 min-h-[400px]">
          <Spinner />
          <p className="text-on-border mt-4">Cargando casos...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong>{error}
        </div>
      )}

      {!loading && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
        >
          <Table
            data={filteredCasos.map((caso) => ({
              codigo: caso.id_caso.toString(),
              solicitante: caso.nombre_completo_solicitante || caso.cedula,
              materia: (caso.nombre_materia || caso.tramite || 'Sin materia').replace(/^Materia\s+/i, ''),
              estatus: caso.estatus || 'N/A',
              responsable: caso.nombre_responsable || 'Sin asignar',
            }))}
            columns={["Código", "Solicitante", "Materia", "Estatus", "Responsable"]}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            actions={[
              {
                label: (
                  <>
                    <Download className="w-4 h-4 text-gray-500 group-hover:text-yellow-600 transition-colors" />
                    Descargar historial de caso
                  </>
                ),
                onClick: handleDownloadHistorial
              }
            ]}
          />
        </motion.div>
      )}

      <CaseFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCase}
        initialCedula={initialCedula}
        initialCedulaTipo={initialCedulaTipo}
        isEditing={!!editingCase}
        initialData={editingCase}
      />

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeleteMotivo('');
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar caso permanentemente"
        message={
          <div>
            <p className="mb-4 text-base text-foreground">
              ¿Estás seguro de que deseas eliminar el caso <strong>{casoToDelete?.codigo}</strong> del solicitante <strong>{casoToDelete?.solicitante}</strong>?
            </p>
            <p className="mb-6 text-red-600 font-semibold text-base">
              Esta acción es irreversible y solo puede realizarla un coordinador. Se eliminarán todas las referencias asociadas (citas, acciones, soportes, etc.).
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
    </>
  );
}
