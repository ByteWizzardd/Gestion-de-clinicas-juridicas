"use client"; 

import { useState, useEffect } from "react";
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";
import Spinner from "@/components/ui/feedback/Spinner";

export default function ApplicantsPage() {
  const [solicitantes, setSolicitantes] = useState([]);
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
      />
    </>
  );
}