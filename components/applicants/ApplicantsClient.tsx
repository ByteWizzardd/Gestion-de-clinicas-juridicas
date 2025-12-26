'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import CaseTools from '@/components/CaseTools/CaseTools';
import Table from '@/components/Table/Table';
import ApplicantFormModal from '@/components/forms/ApplicantFormModal';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';
import { getSolicitantesAction } from '@/app/actions/solicitantes';

interface Solicitante extends Record<string, unknown> {
  cedula: string;
  nombre_completo: string;
  telefono_celular: string;
  nucleo: string | null;
  fecha_solicitud: string | null;
}

interface ApplicantsClientProps {
  initialSolicitantes: Solicitante[];
  initialNucleos: Array<{ id_nucleo: number; nombre_nucleo: string }>;
}

export default function ApplicantsClient({
  initialSolicitantes,
  initialNucleos,
}: ApplicantsClientProps) {
  const router = useRouter();
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>(initialSolicitantes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registeredCedula, setRegisteredCedula] = useState<{ tipo: string; numero: string } | null>(null);
  const [registeredNombre, setRegisteredNombre] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [nucleoFilter, setNucleoFilter] = useState('');
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

  // Preparar opciones de núcleos
  const nucleoOptions = useMemo(() => {
    const nucleos = new Set<string>();
    solicitantes.forEach(s => {
      if (s.nucleo) {
        nucleos.add(s.nucleo);
      }
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
  }, [solicitantes, initialNucleos]);

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
    const solicitante = data as Solicitante;
    router.push(`/dashboard/applicants/${solicitante.cedula}`);
  };

  const handleEdit = (data: Record<string, unknown>) => {
    const solicitante = data as Solicitante;
    alert(`Editar solicitante: ${solicitante.nombre_completo}`);
  };

  const handleDelete = (data: Record<string, unknown>) => {
    const solicitante = data as Solicitante;
    const confirmDelete = window.confirm(
      `¿Está seguro de que desea eliminar al solicitante ${solicitante.nombre_completo}?`
    );
    if (confirmDelete) {
      alert(`Eliminar solicitante: ${solicitante.nombre_completo}`);
    }
  };

  const handleRefresh = async () => {
    const result = await getSolicitantesAction();
    if (result.success && result.data) {
      setSolicitantes(result.data);
    }
  };

  return (
    <>
      <motion.div 
        className="mb-4 md:mb-6 mt-4"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
      >
        <h1 className="text-4xl m-3 font-semibold font-primary">Solicitantes</h1>
        <p className="mb-6 ml-3">Listado y búsqueda de todas las personas atendidas.</p>
      </motion.div>
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
      >
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
      </motion.div>
      <div className="mt-10"></div>

      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
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
        />
      </motion.div>

      <ApplicantFormModal
        isOpen={isModalOpen && !showConfirmModal}
        onClose={() => {
          setIsModalOpen(false);
          setShowConfirmModal(false);
          setRegisteredCedula(null);
          setRegisteredNombre('');
        }}
        onSubmit={async (data: unknown) => {
          const solicitante = (data as any).data?.solicitante;
          if (solicitante && solicitante.cedula) {
            const cedulaCompleta = solicitante.cedula;
            const tipo = cedulaCompleta.charAt(0);
            // Extraer solo los números, eliminando guiones y cualquier otro carácter
            const numero = cedulaCompleta.substring(1).replace(/[^0-9]/g, '');
            setRegisteredCedula({ tipo, numero });
            setRegisteredNombre(solicitante.nombres && solicitante.apellidos 
              ? `${solicitante.nombres} ${solicitante.apellidos}` 
              : '');
          }
          
          await handleRefresh();
          setIsModalOpen(false);
          setShowConfirmModal(true);
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
    </>
  );
}

