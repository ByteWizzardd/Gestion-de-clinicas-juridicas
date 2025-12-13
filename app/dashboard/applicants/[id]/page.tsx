'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import PersonalInfoTab from '@/components/solicitantes/tabs/PersonalInfoTab';
import ContactInfoTab from '@/components/solicitantes/tabs/ContactInfoTab';
import SocioeconomicInfoTab from '@/components/solicitantes/tabs/SocioeconomicInfoTab';
import LocationHousingTab from '@/components/solicitantes/tabs/LocationHousingTab';
import CasesTab from '@/components/solicitantes/tabs/CasesTab';

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cedula = params.id as string;
  
  const [solicitante, setSolicitante] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cedula) {
      fetchSolicitante();
    }
  }, [cedula]);

  const fetchSolicitante = async () => {
    if (!cedula) {
      setError('Cédula no proporcionada');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/solicitantes/${cedula}`);
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Error al cargar la información del solicitante');
      }
      
      if (result.success && result.data) {
        setSolicitante(result.data);
      } else {
        throw new Error(result.message || 'No se pudo obtener la información');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching solicitante:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Cargando información del solicitante...</div>
        </div>
      </div>
    );
  }

  if (error || !solicitante) {
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
          <span>{error || 'No se encontró el solicitante'}</span>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'personal',
      label: 'Información Personal',
      content: <PersonalInfoTab cliente={solicitante} />,
    },
    {
      id: 'contacto',
      label: 'Información de Contacto',
      content: <ContactInfoTab cliente={solicitante} />,
    },
    {
      id: 'socioeconomica',
      label: 'Información Socioeconómica',
      content: <SocioeconomicInfoTab cliente={solicitante} />,
    },
    {
      id: 'ubicacion',
      label: 'Ubicación y Vivienda',
      content: <LocationHousingTab cliente={solicitante} />,
    },
    {
      id: 'casos',
      label: 'Casos Asociados',
      content: <CasesTab casos={solicitante.casos || []} />,
    },
  ];

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Volver</span>
      </button>
      
      <h1 className="text-4xl font-semibold mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        {solicitante.nombres} {solicitante.apellidos}
      </h1>
      <p className="text-base text-gray-500 mb-8">
        Cédula: {solicitante.cedula}
      </p>

      <Tabs tabs={tabs} defaultTab="personal" />
    </div>
  );
}

