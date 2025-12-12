'use client';
import { useState } from 'react';
import MetricCard from "@/components/cards/MetricCard";
import { CircleCheck, Briefcase } from 'lucide-react';
import CompactCalendar from "@/components/ui/calendar/CompactCalendar";
import DashboardAppointmentList from "@/components/cards/DashboardAppointmentList";
import ActionHistoryList from "@/components/cards/ActionHistoryList";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Datos de ejemplo para las citas
  const appointments = [
    {
      time: "10:00 AM",
      title: "Orientación Familiar",
      client: "Cliente: Sofía R.",
      reason: "Motivo: Divorcio"
    },
    {
      time: "2:30 PM",
      title: "Firma de Documento",
      client: "Cliente: Pedro D.",
      reason: "Motivo: Poder Especial"
    }
  ];

  // Datos de ejemplo para el historial de acciones
  const actions = [
    {
      mainText: "Ver Bitácora Completa",
      subText: "hola este es un ejemplo",
      caseInfo: "Caso: C-001 (S. Rodríguez) - UCAB GY",
      date: "15 Ene 2024",
      time: "14:30",
      actionType: "view" as const
    },
    {
      mainText: "Segunda Cita Programada",
      subText: "hola este es otro ejemplo",
      caseInfo: "Caso: C-005 (M. García) - UCAB GY",
      date: "14 Ene 2024",
      time: "10:15",
      actionType: "appointment" as const
    },
    {
      mainText: "Carga de Documentos",
      subText: "Originales",
      caseInfo: "Caso: C-008 (J. Rivero) - UCAB GY",
      date: "13 Ene 2024",
      time: "16:45",
      actionType: "document" as const
    },
    {
      mainText: "Actualización de Estado",
      subText: "En revisión",
      caseInfo: "Caso: C-003 (A. Martínez) - UCAB GY",
      date: "12 Ene 2024",
      time: "09:20",
      actionType: "update" as const
    }
  ];
  
  return (
    <div className="max-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-4 md:mb-6 mt-4">
          <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Bienvenido al dashboard
        </h1>
          <p className="text-sm md:text-base text-gray-600" style={{ fontFamily: 'var(--font-urbanist)' }}>
          Aquí podrás ver el estado de las citas y los casos.
        </p>
      </div>

      {/* Contenedor principal para layout lado a lado */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mt-4 md:mt-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
        {/* Cards de métricas */}
          <div className="flex flex-col gap-4 md:gap-6 flex-1 max-w-full">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <div className="flex-1 w-full sm:max-w-85 2xl:max-w-96">
              <MetricCard
                title="Expedientes Cerrados"
                mainValue="12"
                subtitle="35 Beneficiarios Atendidos"
                  icon={CircleCheck}
              />
            </div>
              <div className="flex-1 w-full sm:max-w-85 2xl:max-w-96">
              <MetricCard
                title="Foco del Trámite"
                mainValue="Asesoría"
                subtitle="4 Casos en Redacción Documental"
                  icon={Briefcase}
              />
            </div>
          </div>
          
          {/* Agenda */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 md:p-6 w-full lg:max-w-[calc(2*21.25rem+1.5rem)] 2xl:max-w-[calc(2*24rem+1.5rem)] flex-1 flex flex-col min-h-0">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0">
                {/* Mitad izquierda - Título y lista de citas */}
                <div className="w-full md:w-1/2 flex flex-col min-h-0">
                  <h3 className="text-xl md:text-2xl font-semibold text-neutral-800 mb-3 md:mb-4 flex-shrink-0">
              Tu Agenda
            </h3>
                  <div className="flex-1 overflow-y-auto pr-2 min-h-[200px] md:min-h-0">
                    <DashboardAppointmentList appointments={appointments} />
                  </div>
                </div>
                {/* Mitad derecha - Calendario */}
                <div className="w-full md:w-1/2 flex items-center justify-center min-h-[300px] md:min-h-0">
                  <div className="w-full h-full">
                    <CompactCalendar
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones recientes */}
          <div className="flex-1 w-full lg:min-w-94 lg:max-w-116 2xl:max-w-[28rem]">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 md:p-6 h-full min-h-[200px] lg:min-h-0 flex flex-col">
              <h3 className="text-xl md:text-2xl font-semibold text-center text-neutral-800 mb-4 md:mb-6 flex-shrink-0">
                Historial de Acciones
              </h3>
              <div className="flex-1 overflow-y-auto">
                <ActionHistoryList actions={actions} />
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}