'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import CaseTools from '@/components/CaseTools/CaseTools';
import Table from '@/components/Table/Table';
import CaseFormModal from '@/components/forms/CaseFormModal';
import Spinner from '@/components/ui/feedback/Spinner';
import { ESTATUS_CASO, TRAMITES } from '@/lib/constants/status';
import { getCasosAction } from '@/app/actions/casos';
import { createCasoAction, uploadSoportesAction } from '@/app/actions/casos';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('');
  const [tramiteFilter, setTramiteFilter] = useState('');
  const [initialCedula, setInitialCedula] = useState<string>('');
  const [initialCedulaTipo, setInitialCedulaTipo] = useState<string>('V');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
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
        setCasos(result.data);
      } else {
        setCasos([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
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
    if (!searchValue && !estatusFilter && !tramiteFilter) {
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

      const matchesEstatus = !estatusFilter || caso.estatus === estatusFilter;
      const matchesTramite = !tramiteFilter || caso.tramite === tramiteFilter;

      return matchesSearch && matchesEstatus && matchesTramite;
    });
  }, [casos, searchValue, estatusFilter, tramiteFilter]);

  const handleView = (data: Record<string, unknown>) => {
    const caso = data as TableRow;
    router.push(`/dashboard/cases/${caso.codigo}`);
  };

  const handleEdit = (data: Record<string, unknown>) => {
    const caso = data as TableRow;
    alert(`Editar caso: ${caso.codigo}`);
  };

  const handleDelete = (data: Record<string, unknown>) => {
    const caso = data as TableRow;
    alert(`Eliminar caso: ${caso.codigo}`);
  };

  const handleAddCase = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitCase = async (data: unknown) => {
    try {
      const caseData = data as any;
      const archivos = Array.isArray(caseData.archivos) ? caseData.archivos : [];
      
      const casoDataSinArchivos = {
        fecha_solicitud: caseData.fecha_solicitud,
        fecha_inicio_caso: caseData.fecha_inicio_caso,
        cedula: caseData.cedula,
        id_materia: caseData.id_materia,
        num_categoria: caseData.num_categoria ?? 0, // Usar 0 si es null/undefined
        num_subcategoria: caseData.num_subcategoria ?? 0, // Usar 0 si es null/undefined
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
        const idCaso = result.data.id_caso || (result.data as any).id_caso;
        
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
      alert(`Error al crear el caso: ${errorMessage}`);
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
          estatusFilter={estatusFilter}
          onEstatusChange={setEstatusFilter}
          estatusOptions={estatusOptions}
          tramiteFilter={tramiteFilter}
          onTramiteChange={setTramiteFilter}
          tramiteOptions={tramiteOptions}
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
              materia: caso.nombre_materia || caso.tramite || 'N/A',
              estatus: caso.estatus || 'N/A',
              responsable: caso.nombre_responsable || 'Sin asignar',
            }))}
            columns={["Código", "Solicitante", "Materia", "Estatus", "Responsable"]}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>
      )}

      <CaseFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCase}
        initialCedula={initialCedula}
        initialCedulaTipo={initialCedulaTipo}
      />
    </>
  );
}

