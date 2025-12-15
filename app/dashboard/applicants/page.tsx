"use client"; 

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";
import Spinner from "@/components/ui/feedback/Spinner";
import ApplicantFormModal from "@/components/forms/ApplicantFormModal";
import ConfirmModal from "@/components/ui/feedback/ConfirmModal";

interface Solicitante extends Record<string, unknown> {
  cedula: string;
  nombre_completo: string;
  telefono_celular: string;
  nucleo: string | null;
  fecha_solicitud: string | null;
}

export default function ApplicantsPage() {
  const router = useRouter();
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registeredCedula, setRegisteredCedula] = useState<{ tipo: string; numero: string } | null>(null);
  const [registeredNombre, setRegisteredNombre] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [nucleoFilter, setNucleoFilter] = useState('');
  const [nucleosOptions, setNucleosOptions] = useState<{ value: string; label: string }[]>([]);

  const fetchSolicitantes = async () => {
    setLoading(true); 
    try {
      const response = await fetch("/api/solicitantes");
      
      // Verifica si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setSolicitantes(data.data);
      } else {
        console.error("Error fetching solicitantes:", data.message);
      }
    } catch (error) {
      console.error("Error fetching solicitantes:", error);
    } finally {
      setLoading(false); 
    }
  };

  // Cargar núcleos para el filtro
  const fetchNucleos = async () => {
    try {
      const response = await fetch("/api/nucleos");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const options = result.data.map((n: { id_nucleo: number; nombre_nucleo: string }) => ({
            value: n.nombre_nucleo,
            label: n.nombre_nucleo,
          }));
          setNucleosOptions(options);
        }
      }
    } catch (error) {
      console.error("Error fetching nucleos:", error);
    }
  };

  useEffect(() => {
    fetchSolicitantes();
    fetchNucleos();
  }, []);

  // Función para normalizar texto removiendo acentos
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
      .toLowerCase();
  };

  // Obtener núcleos únicos para el filtro (combinado con opciones de API)
  const nucleoOptions = useMemo(() => {
    const nucleos = new Set<string>();
    solicitantes.forEach(s => {
      if (s.nucleo) {
        nucleos.add(s.nucleo);
      }
    });
    // Combinar con opciones de la API si existen
    nucleosOptions.forEach(opt => {
      if (opt.value) {
        nucleos.add(opt.value);
      }
    });
    return Array.from(nucleos).map(nucleo => ({
      value: nucleo,
      label: nucleo
    }));
  }, [solicitantes, nucleosOptions]);

  // Filtrar solicitantes
  const filteredSolicitantes = useMemo(() => {
    if (!searchValue && !nucleoFilter) {
      return solicitantes;
    }

    return solicitantes.filter((solicitante) => {
      // Filtro por búsqueda (busca en cédula, nombre completo, teléfono)
      const normalizedSearch = normalizeText(searchValue);
      const matchesSearch = 
        !searchValue ||
        solicitante.cedula.includes(searchValue) ||
        normalizeText(solicitante.nombre_completo || '').includes(normalizedSearch) ||
        normalizeText(solicitante.telefono_celular || '').includes(normalizedSearch);

      // Filtro por núcleo
      const matchesNucleo = !nucleoFilter || solicitante.nucleo === nucleoFilter;

      return matchesSearch && matchesNucleo;
    });
  }, [solicitantes, searchValue, nucleoFilter]);

  // Manejar acción de ver
  const handleView = (data: Record<string, unknown>) => {
    const solicitante = data as Solicitante;
    router.push(`/dashboard/applicants/${solicitante.cedula}`);
  };

  // Manejar acción de editar
  const handleEdit = (data: Record<string, unknown>) => {
    const solicitante = data as Solicitante;
    // TODO: Implementar lógica de edición
    alert(`Editar solicitante: ${solicitante.nombre_completo}`);
  };

  // Manejar acción de eliminar
  const handleDelete = (data: Record<string, unknown>) => {
    const solicitante = data as Solicitante;
    // TODO: Implementar lógica de eliminación con confirmación
    const confirmDelete = window.confirm(
      `¿Está seguro de que desea eliminar al solicitante ${solicitante.nombre_completo}?`
    );
    if (confirmDelete) {
      // Aquí iría la llamada a la API para eliminar
      alert(`Eliminar solicitante: ${solicitante.nombre_completo}`);
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 min-h-[400px]">
        <Spinner />
        <p className="text-on-border mt-4">Cargando solicitantes...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Solicitantes</h1>
      <p className="mb-6 ml-3">Listado y búsqueda de todas las personas atendidas.</p>
      <CaseTools 
        addLabel="Añadir Solicitante" 
        onAddClick={() => setIsModalOpen(true)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        estatusFilter={nucleoFilter}
        onEstatusChange={setNucleoFilter}
        estatusOptions={nucleoOptions}
        tramiteFilter=""
        onTramiteChange={() => {}}
        tramiteOptions={[]}
      />
      <div className="mt-10"></div>
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
      />

      {/* Modal de registro de solicitante */}
      <ApplicantFormModal
        isOpen={isModalOpen && !showConfirmModal}
        onClose={() => {
          setIsModalOpen(false);
          setShowConfirmModal(false);
          setRegisteredCedula(null);
          setRegisteredNombre('');
        }}
        onSubmit={(data: any) => {
          // Guardar datos del solicitante registrado para el modal de confirmación
          // El servicio devuelve { cliente, vivienda, nivelEducativo, trabajo, hogar }
          const cliente = data.data?.cliente;
          if (cliente && cliente.cedula) {
            const cedulaCompleta = cliente.cedula;
            const tipo = cedulaCompleta.charAt(0);
            const numero = cedulaCompleta.substring(1);
            setRegisteredCedula({ tipo, numero });
            setRegisteredNombre(cliente.nombres && cliente.apellidos 
              ? `${cliente.nombres} ${cliente.apellidos}` 
              : '');
          }
          
          // Recargar la lista de solicitantes
          fetchSolicitantes();
          
          // Cerrar el modal de registro y mostrar el modal de confirmación
          setIsModalOpen(false);
          setShowConfirmModal(true);
        }}
      />
      
      {/* Modal de confirmación para asociar caso */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setRegisteredCedula(null);
          setRegisteredNombre('');
        }}
        onConfirm={() => {
          setShowConfirmModal(false);
          // Navegar a la página de casos con la cédula prellenada
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
    </>
  );
}