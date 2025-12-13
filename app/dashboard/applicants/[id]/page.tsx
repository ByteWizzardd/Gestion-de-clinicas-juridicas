'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Volver</span>
      </button>
      
      <h1 className="text-4xl font-semibold mb-4" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        Detalle del Solicitante
      </h1>
      <p className="text-2xl text-gray-600 mb-2">
        Hola
      </p>
      <p className="text-base text-gray-500">
        ID: {id}
      </p>
    </div>
  );
}

