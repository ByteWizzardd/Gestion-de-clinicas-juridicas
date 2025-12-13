'use client';
import { useState, useEffect, useMemo } from 'react';
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/table/Table";
import CaseFormModal from "@/components/forms/CaseFormModal";
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
  const [casos, setCasos] = useState<Caso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('');
  const [tramiteFilter, setTramiteFilter] = useState('');

  // Opciones para los filtros
  const estatusOptions = [
    { value: ESTATUS_CASO.EN_REVISION, label: ESTATUS_CASO.EN_REVISION },
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

      const response = await fetch('/api/casos');

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
      console.error('Error al cargar casos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchCasos();
  }, []);

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
    console.log('Ver caso:', data);
    // Aquí puedes abrir un modal o navegar a una página de detalle
  };

  const handleEdit = (data: TableRow) => {
    console.log('Editar caso:', data);
    // Aquí puedes abrir un modal de edición
  };

  const handleDelete = (data: TableRow) => {
    console.log('Eliminar caso:', data);
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
      console.log('Datos enviados al servidor:', data);
      
      const response = await fetch('/api/casos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (!response.ok) {
        const errorMessage = result.error?.message || 'Error al crear el caso';
        const errorCode = result.error?.code || 'UNKNOWN_ERROR';
        const errorFields = result.error?.fields;
        
        console.error('Error del servidor:', {
          status: response.status,
          message: errorMessage,
          code: errorCode,
          fields: errorFields,
        });
        
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

      alert('Caso registrado exitosamente');
      setIsModalOpen(false);
      fetchCasos();
    } catch (err) {
      console.error('Error al crear caso:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error al crear el caso: ${errorMessage}\n\nRevisa la consola para más detalles.`);
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
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-600">Cargando casos...</div>
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
      />
    </>
  );
}

