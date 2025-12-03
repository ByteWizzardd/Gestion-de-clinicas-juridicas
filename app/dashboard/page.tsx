import MetricCard from "@/components/cards/MetricCard";

export default function DashboardPage() {
  return (
    <div className="h-full">
      <div className="mb-6 mt-4">
        <h1 className="text-3xl font-medium text-foreground mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Bienvenido al dashboard
        </h1>
        <p className="text-base text-gray-600" style={{ fontFamily: 'var(--font-urbanist)' }}>
          Aquí podrás ver el estado de las citas y los casos.
        </p>
      </div>

      {/* Contenedor principal para layout lado a lado */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Cards de métricas */}
        <div className="flex flex-col gap-6 flex-1">
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-72 max-w-96">
              <MetricCard
                title="Expedientes Cerrados"
                mainValue="12"
                subtitle="35 Beneficiarios Atendidos"
              />
            </div>
            <div className="flex-1 min-w-72 max-w-96">
              <MetricCard
                title="Foco del Trámite"
                mainValue="Asesoría"
                subtitle="4 Casos en Redacción Documental"
              />
            </div>
          </div>
          
          {/* Bandeja de entrada */}
          <div className="bg-white rounded-3xl shadow-md p-6 w-full">
            <h3 className="text-xl font-normal text-neutral-800">
              Bandeja de entrada
            </h3>
          </div>
        </div>

        {/* Sección Tu Agenda */}
        <div className="flex-1 min-w-72 lg:max-w-96">
          <div className="bg-white rounded-3xl shadow-md p-6 h-full">
            <h3 className="text-xl font-normal text-center text-neutral-800">
              Tu Agenda
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}