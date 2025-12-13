"use client"; 

import { useState, useEffect, useMemo } from "react";
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";
import Spinner from "@/components/ui/feedback/Spinner";
import ApplicantFormModal from "@/components/forms/ApplicantFormModal";

interface Solicitante {
  cedula: string;
  nombre_completo: string;
  telefono_celular: string;
  nucleo: string | null;
  fecha_solicitud: string | null;
}

export default function ApplicantsPage() {
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        solicitante.telefono_celular.includes(searchValue);

      // Filtro por núcleo
      const matchesNucleo = !nucleoFilter || solicitante.nucleo === nucleoFilter;

      return matchesSearch && matchesNucleo;
    });
  }, [solicitantes, searchValue, nucleoFilter]);

  // Mostrar loading
  if (loading) {
    return (
      <div className="p-8">
      {/* Componente de spinner 
      <Spinner></Spinner>*/}
      <p className="text-on-border">Cargando solicitantes...</p>
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
        estatusOptions={nucleosOptions}
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
      />

      {/* Modal de registro de solicitante */}
      <ApplicantFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          // Recargar la lista de solicitantes después de registrar
          fetchSolicitantes();
          setIsModalOpen(false);
        }}
      />
    </>
  );
}