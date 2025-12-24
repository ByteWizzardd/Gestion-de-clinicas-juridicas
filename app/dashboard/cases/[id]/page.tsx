'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import GeneralInfoTab from '@/components/cases/tabs/GeneralInfoTab';
import TeamTab from '@/components/cases/tabs/TeamTab';
import ActionsHistoryTab from '@/components/cases/tabs/ActionsHistoryTab';
import AppointmentsTab from '@/components/cases/tabs/AppointmentsTab';
import StatusChangesTab from '@/components/cases/tabs/StatusChangesTab';
import DocumentsTab from '@/components/cases/tabs/DocumentsTab';
import { getCasoByIdAction } from '@/app/actions/casos';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCaso();
    }
  }, [id]);

  const fetchCaso = async () => {
    const idCaso = parseInt(id, 10);
    if (isNaN(idCaso)) {
      setError('ID de caso inválido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await getCasoByIdAction(idCaso);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar la información del caso');
      }
      
      if (result.data) {
        setCaso(result.data);
      } else {
        throw new Error('No se pudo obtener la información');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching caso:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Cargando información del caso...</div>
        </div>
      </div>
    );
  }

  if (error || !caso) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span>{error || 'No se encontró el caso'}</span>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'general',
      label: 'Información General',
      content: <GeneralInfoTab caso={caso} />,
    },
    {
      id: 'equipo',
      label: 'Equipo Asignado',
      content: <TeamTab equipo={caso.equipo} />,
    },
    {
      id: 'acciones',
      label: 'Historial de Acciones',
      content: <ActionsHistoryTab acciones={caso.acciones} />,
    },
    {
      id: 'citas',
      label: 'Citas y Orientaciones',
      content: <AppointmentsTab citas={caso.citas} />,
    },
    {
      id: 'estatus',
      label: 'Cambios de Estatus',
      content: <StatusChangesTab cambiosEstatus={caso.cambiosEstatus} />,
    },
    {
      id: 'documentos',
      label: 'Soportes y Documentos',
      content: <DocumentsTab soportes={caso.soportes} />,
    },
  ];

  const codigoCaso = caso.id_caso.toString();
  const nombreSolicitante = caso.nombre_completo_solicitante || 'Caso sin solicitante';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumbs
        items={[
          { label: 'Casos', href: '/dashboard/cases' },
          { label: codigoCaso }
        ]}
      />
      
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        {codigoCaso}
      </h1>
      {nombreSolicitante && (
        <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
          Solicitante: {nombreSolicitante}
        </p>
      )}

      <Tabs tabs={tabs} defaultTab="general" />
    </div>
  );
}
