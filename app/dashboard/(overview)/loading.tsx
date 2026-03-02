import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-4 md:mb-6 mt-4">
          <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-1 transition-colors" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            Bienvenido al dashboard
          </h1>
          <p className="text-sm md:text-base text-[var(--card-text-muted)] transition-colors" style={{ fontFamily: 'var(--font-urbanist)' }}>
            Aquí podrás ver el estado de las citas y los casos.
          </p>
        </div>

        {/* Contenedor Principal */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mt-4 md:mt-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">

          {/* Columna Izquierda (Casos + Agenda) */}
          <div className="flex flex-col gap-4 md:gap-6 flex-1 max-w-full">

            {/* Sección: Mis Casos */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 md:p-6 flex-1 flex flex-col min-h-0 relative overflow-hidden transition-colors">
              {/* Header Casos */}
              <div className="flex items-center justify-between mb-4 shrink-0 px-2">
                <Skeleton width={140} height={28} borderRadius="6px" />
                <Skeleton width={80} height={20} borderRadius="12px" />
              </div>
              {/* Lista Casos */}
              <div className="space-y-4 px-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-2">
                    <Skeleton width={48} height={48} borderRadius="12px" />
                    <div className="flex-1 space-y-2">
                      <Skeleton width="40%" height={16} borderRadius="4px" />
                      <Skeleton width="25%" height={14} borderRadius="4px" />
                    </div>
                    <Skeleton width={80} height={24} borderRadius="6px" />
                  </div>
                ))}
              </div>
            </div>

            {/* Sección: Mi Agenda */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 md:p-6 w-full flex-1 flex flex-col min-h-0 relative overflow-hidden transition-colors">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0">

                {/* Left: Lista de Citas */}
                <div className="w-full md:w-1/2 flex flex-col min-h-0 px-2">
                  <Skeleton width={120} height={28} borderRadius="6px" className="mb-4" />
                  <div className="space-y-4 pr-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-[var(--ui-bg-muted)] border border-[var(--card-border)] rounded-xl transition-colors">
                        <Skeleton width={50} height={50} borderRadius="10px" />
                        <div className="flex-1 py-1 space-y-2">
                          <Skeleton width="80%" height={14} borderRadius="4px" />
                          <Skeleton width="50%" height={12} borderRadius="4px" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Calendario */}
                <div className="w-full md:w-1/2 flex items-center justify-center min-h-[300px] md:min-h-0">
                  <div className="w-full max-w-[320px] aspect-square p-2">
                    <div className="flex justify-between mb-4">
                      <Skeleton width={32} height={32} borderRadius="50%" />
                      <Skeleton width={100} height={24} borderRadius="6px" />
                      <Skeleton width={32} height={32} borderRadius="50%" />
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {[...Array(35)].map((_, i) => (
                        <Skeleton key={i} width="100%" height={32} borderRadius="50%" className="mx-auto" />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Columna Derecha (Historial de Acciones) */}
          <div className="flex-1 w-full lg:min-w-94 lg:max-w-116 2xl:max-w-md">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 md:p-6 h-full min-h-[200px] lg:min-h-0 flex flex-col relative overflow-hidden transition-colors">
              <div className="flex justify-center mb-6">
                <Skeleton width={180} height={28} borderRadius="6px" />
              </div>
              <div className="space-y-6 px-2 flex-1 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton width={36} height={36} borderRadius="50%" className="shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <Skeleton width="95%" height={14} borderRadius="4px" />
                      <Skeleton width="70%" height={12} borderRadius="4px" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
