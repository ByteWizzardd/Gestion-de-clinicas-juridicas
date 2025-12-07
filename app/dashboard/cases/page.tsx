'use client';
import { useState, useEffect } from 'react';
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/table/Table";

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

  // Función para cargar los casos desde la API
  const fetchCasos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/casos');

      if (!response.ok) {
        throw new Error('Error al cargar los casos');
      }

      const data = await response.json();
      setCasos(data);
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

  // Transformar los datos para la tabla
  const tableData: TableRow[] = casos.map((caso) => ({
    codigo: `CASE-${caso.id_caso}`,
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

  return (
    <>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl m-3 font-semibold font-primary">Listado de Casos</h1>
      <p className="mb-6 ml-3 text-base">Directorio principal de todos los casos</p>
      <CaseTools addLabel="Añadir Caso" />
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
    </>
  );
}

