'use client';
import MetricCard from "@/components/cards/MetricCard";
import { CircleCheck, Briefcase } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="max-h-screen">
      <div className="mb-6 mt-4">
        <h1 className="text-3xl font-medium text-foreground mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Bienvenido al dashboard
        </h1>
        <p className="text-base text-gray-600" style={{ fontFamily: 'var(--font-urbanist)' }}>
          Aquí podrás ver el estado de las citas y los casos.
        </p>
      </div>

      {/* Contenedor principal para layout lado a lado */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6 h-[calc(100vh-10rem)]">
        {/* Cards de métricas */}
        <div className="flex flex-col gap-6 flex-1">
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 max-w-85">
              <MetricCard
                title="Expedientes Cerrados"
                mainValue="12"
                subtitle="35 Beneficiarios Atendidos"
                icon={CircleCheck}
              />
            </div>
            <div className="flex-1 max-w-85">
              <MetricCard
                title="Foco del Trámite"
                mainValue="Asesoría"
                subtitle="4 Casos en Redacción Documental"
                icon={Briefcase}
              />
            </div>
          </div>
          
          {/* Agenda */}
          <div className="bg-white rounded-3xl shadow-md p-6 max-w-[calc(2*21.25rem+1.5rem)] flex-1">
            <h3 className="text-xl font-normal text-neutral-800">
              Tu Agenda
            </h3>
          </div>
        </div>

        {/* Acciones recinetes */}
        <div className="flex-1 min-w-94 lg:max-w-116">
          <div className="bg-white rounded-3xl shadow-md p-6 h-full">
            <h3 className="text-xl font-normal text-center text-neutral-800"> Acciones Recientes </h3>
          </div>
        </div>
      </div>
    </div>
  );
}