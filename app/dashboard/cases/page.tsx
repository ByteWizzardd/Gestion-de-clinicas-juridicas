'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";
import CaseFormModal from "@/components/forms/CaseFormModal";
import Spinner from "@/components/ui/feedback/Spinner";
import { getApiHeaders } from "@/lib/utils/api-client";
import { ESTATUS_CASO, TRAMITES } from '@/lib/constants/status';

interface Caso {
  id_caso: number;
  fecha_inicio_caso: string;
  fecha_fin_caso: string | null;
  tramite: string;
  estatus: string;
  observaciones: string;
  id_nucleo: number;
  id_ambito_legal: number;
  id_expediente: string | null;
  cedula_cliente: string;
  nombre_completo_cliente: string;
  nombre_responsable: string | null;
}

interface TableRow extends Record<string, unknown> {
  codigo: string;
  solicitante: string;
  materia: string;
  estatus: string;
  responsable: string;
}

export default function CasesPage() {
  const router = useRouter();
  const [casos, setCasos] = useState<Caso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('');
  const [tramiteFilter, setTramiteFilter] = useState('');
  const [initialCedula, setInitialCedula] = useState<string>('');
  const [initialCedulaTipo, setInitialCedulaTipo] = useState<string>('V');

  // Opciones para los filtros
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

  // Función para cargar los casos desde la API
  const fetchCasos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/casos', {
        headers: getApiHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al cargar los casos');
      }

      const result = await response.json();
      
      // La respuesta ahora viene en formato { success: true, data: [...] }
      if (result.success && result.data) {
        setCasos(result.data);
      } else {
        // Fallback por si la respuesta no tiene el formato esperado
        setCasos(Array.isArray(result) ? result : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchCasos();
  }, []);

  // Leer parámetros de URL para abrir modal con cédula prellenada
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const cedula = searchParams.get('cedula');
    const cedulaTipo = searchParams.get('cedulaTipo');
    
    if (cedula && cedulaTipo) {
      // Extraer el número de cédula (sin el tipo)
      const cedulaNumero = cedula.startsWith(cedulaTipo) ? cedula.substring(cedulaTipo.length) : cedula;
      setInitialCedula(cedulaNumero);
      setInitialCedulaTipo(cedulaTipo);
      setIsModalOpen(true);
      
      // Limpiar los parámetros de la URL
      router.replace('/dashboard/cases');
    }
  }, [router]);

  // Función para normalizar texto removiendo acentos
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
      .toLowerCase();
  };

  // Transformar y filtrar los datos para la tabla
  const filteredCasos = useMemo(() => {
    if (!searchValue && !estatusFilter && !tramiteFilter) {
      return casos;
    }

    return casos.filter((caso) => {
      // Filtro por búsqueda (busca en código, solicitante, materia, estatus, responsable)
      // Normaliza tanto el texto de búsqueda como los campos para comparar sin acentos
      const normalizedSearch = normalizeText(searchValue);
      const matchesSearch = 
        !searchValue ||
        caso.id_caso.toString().includes(searchValue) ||
        normalizeText(caso.nombre_completo_cliente || '').includes(normalizedSearch) ||
        normalizeText(caso.tramite || '').includes(normalizedSearch) ||
        normalizeText(caso.estatus || '').includes(normalizedSearch) ||
        normalizeText(caso.nombre_responsable || '').includes(normalizedSearch);

      // Filtro por estatus
      const matchesEstatus = !estatusFilter || caso.estatus === estatusFilter;

      // Filtro por trámite
      const matchesTramite = !tramiteFilter || caso.tramite === tramiteFilter;

      return matchesSearch && matchesEstatus && matchesTramite;
    });
  }, [casos, searchValue, estatusFilter, tramiteFilter]);

  const tableData: TableRow[] = filteredCasos.map((caso) => ({
    codigo: caso.id_caso.toString(),
    solicitante: caso.nombre_completo_cliente,
    materia: caso.tramite,
    estatus: caso.estatus,
    responsable: caso.nombre_responsable || 'Sin asignar',
  }));

  const handleView = (data: TableRow) => {
    const caso = data as TableRow;
    router.push(`/dashboard/cases/${caso.codigo}`);
  };

  const handleEdit = (data: TableRow) => {
    // Aquí puedes abrir un modal de edición
  };

  const handleDelete = (data: TableRow) => {
    // Aquí puedes mostrar un confirm y eliminar
    if (confirm(`¿Estás seguro de eliminar el caso ${data.codigo}?`)) {
      // Lógica de eliminación
    }
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
      
      // Separar los archivos de los datos del caso antes de serializar
      const casoDataSinArchivos = {
        fecha_solicitud: caseData.fecha_solicitud,
        cedula_cliente: caseData.cedula_cliente,
        id_ambito_legal: caseData.id_ambito_legal,
        tramite: caseData.tramite,
        estatus: caseData.estatus,
        id_nucleo: caseData.id_nucleo,
        observaciones: caseData.observaciones,
      };
      
      // Crear el caso primero
      const response = await fetch('/api/casos', {
        method: 'POST',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(casoDataSinArchivos),
      });

      const result = await response.json();

      if (!response.ok) {
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

      // Si el caso se creó exitosamente y hay archivos, subirlos
      if (archivos.length > 0 && result.success && result.data) {
        // El id_caso puede estar directamente en result.data o en result.data.id_caso
        const idCaso = result.data.id_caso || (result.data as any).id_caso;
        
        if (!idCaso || isNaN(Number(idCaso))) {
          alert('Caso creado exitosamente, pero no se pudo obtener el ID del caso para subir los archivos');
          setIsModalOpen(false);
          fetchCasos();
          return;
        }
        
        // Crear FormData para enviar los archivos
        const formData = new FormData();
        archivos.forEach((archivo: File) => {
          formData.append('archivos', archivo);
        });

        try {
          const uploadResponse = await fetch(`/api/casos/${idCaso}/soportes`, {
            method: 'POST',
            headers: getApiHeaders(),
            body: formData,
          });

          const uploadResult = await uploadResponse.json();
          
          if (!uploadResponse.ok) {
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
      <h1 className="text-2xl sm:text-3xl lg:text-4xl m-3 font-semibold font-primary">Listado de Casos</h1>
      <p className="mb-6 ml-3 text-base">Directorio principal de todos los casos</p>
      <CaseTools 
        addLabel="Añadir Caso" 
        onAddClick={handleAddCase}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        estatusFilter={estatusFilter}
        tramiteFilter={tramiteFilter}
        onEstatusChange={setEstatusFilter}
        onTramiteChange={setTramiteFilter}
        estatusOptions={estatusOptions}
        tramiteOptions={tramiteOptions}
      />
      <div className="mt-10"></div>

      {loading && (
        <div className="flex flex-col justify-center items-center py-12 min-h-[400px]">
          <Spinner />
          <p className="text-on-border mt-4">Cargando casos...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mx-3 mb-4">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <Table
          data={tableData}
          columns={["Código", "Solicitante", "Materia", "Estatus", "Responsable Principal"]}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal de registro de caso */}
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

