'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Tabs from '@/components/ui/Tabs';

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const tabs = [
    {
      id: 'personal',
      label: 'Información Personal',
      content: (
        <div className="p-6">
          <p className="text-lg text-gray-600">Hola - Información Personal</p>
        </div>
      ),
    },
    {
      id: 'contacto',
      label: 'Información de Contacto',
      content: (
        <div className="p-6">
          <p className="text-lg text-gray-600">Hola - Información de Contacto</p>
        </div>
      ),
    },
    {
      id: 'socioeconomica',
      label: 'Información Socioeconómica',
      content: (
        <div className="p-6">
          <p className="text-lg text-gray-600">Hola - Información Socioeconómica</p>
        </div>
      ),
    },
    {
      id: 'ubicacion',
      label: 'Ubicación y Vivienda',
      content: (
        <div className="p-6">
          <p className="text-lg text-gray-600">Hola - Ubicación y Vivienda</p>
        </div>
      ),
    },
    {
      id: 'casos',
      label: 'Casos Asociados',
      content: (
        <div className="p-6">
          <p className="text-lg text-gray-600">Hola - Casos Asociados</p>
        </div>
      ),
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
      
      <h1 className="text-4xl font-semibold mb-4" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        Detalle del Solicitante
      </h1>
      <p className="text-base text-gray-500 mb-8">
        ID: {id}
      </p>

      <Tabs tabs={tabs} defaultTab="personal" />
    </div>
  );
}

