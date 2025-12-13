"use client"; 

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/table/Table";

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

  useEffect(() => {
    fetchSolicitantes();
  }, []);

  // Manejar acción de ver
  const handleView = (data: Record<string, unknown>) => {
    const solicitante = data as Solicitante;
    router.push(`/dashboard/applicants/${solicitante.cedula}`);
  };

  // Manejar acción de editar
  const handleEdit = (data: Record<string, unknown>) => {
    const solicitante = data as Solicitante;
    // TODO: Implementar lógica de edición
    console.log("Editar solicitante:", solicitante);
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
      console.log("Eliminar solicitante:", solicitante);
      // Aquí iría la llamada a la API para eliminar
      alert(`Eliminar solicitante: ${solicitante.nombre_completo}`);
    }
  };

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
      <CaseTools addLabel="Añadir Solicitante" />
      <div className="mt-10"></div>
      <Table
        data={solicitantes}
        columns={["Cédula", "Nombre Completo", "Teléfono Celular", "Núcleo", "Fecha Solicitud"]}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}