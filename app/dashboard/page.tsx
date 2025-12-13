'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import MetricCard from "@/components/cards/MetricCard";
import { CircleCheck, Briefcase } from 'lucide-react';
import CompactCalendar from "@/components/ui/calendar/CompactCalendar";
import DashboardAppointmentList from "@/components/cards/DashboardAppointmentList";
import ActionHistoryList from "@/components/cards/ActionHistoryList";
import type { Appointment } from '@/types/appointment';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Cargar citas desde la API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/citas');
        
        if (!response.ok) {
          throw new Error('Error al cargar las citas');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          // Convertir las fechas de string a Date
          const appointmentsWithDates = result.data.map((apt: any) => ({
            ...apt,
            date: new Date(apt.date),
          }));
          setAppointments(appointmentsWithDates);
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error al cargar citas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);



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
      subText: "En proceso",
      caseInfo: "Caso: C-003 (A. Martínez) - UCAB GY",
      date: "12 Ene 2024",
      time: "09:20",
      actionType: "update" as const
    }
  ];
  
  return (
    <div className="max-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8">
        <motion.div 
          className="mb-4 md:mb-6 mt-4"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Bienvenido al dashboard
        </h1>
          <p className="text-sm md:text-base text-gray-600" style={{ fontFamily: 'var(--font-urbanist)' }}>
          Aquí podrás ver el estado de las citas y los casos.
        </p>
      </motion.div>

      {/* Contenedor principal para layout lado a lado */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mt-4 md:mt-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
        {/* Cards de métricas */}
          <div className="flex flex-col gap-4 md:gap-6 flex-1 max-w-full">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <motion.div 
                className="flex-1 w-full sm:max-w-85 2xl:max-w-96"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
              >
              <MetricCard
                title="Expedientes Cerrados"
                mainValue="12"
                subtitle="35 Beneficiarios Atendidos"
                  icon={CircleCheck}
              />
            </motion.div>
              <motion.div 
                className="flex-1 w-full sm:max-w-85 2xl:max-w-96"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.15, ease: "easeOut" }}
              >
              <MetricCard
                title="Foco del Trámite"
                mainValue="Asesoría"
                subtitle="4 Casos en Redacción Documental"
                  icon={Briefcase}
              />
            </motion.div>
          </div>
          
          {/* Agenda */}
            <motion.div 
              className="bg-white rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 md:p-6 w-full lg:max-w-[calc(2*21.25rem+1.5rem)] 2xl:max-w-[calc(2*24rem+1.5rem)] flex-1 flex flex-col min-h-0"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
            >
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0">
                {/* Mitad izquierda - Título y lista de citas */}
                <div className="w-full md:w-1/2 flex flex-col min-h-0">
                  <h3 className="text-xl md:text-2xl font-semibold text-neutral-800 mb-3 md:mb-4 flex-shrink-0">
              Tu Agenda
            </h3>
                  <div className="flex-1 overflow-y-auto pr-2 min-h-[200px] md:min-h-0">
                    <DashboardAppointmentList 
                      appointments={appointments} 
                      selectedDate={selectedDate}
                      loading={loading}
                      error={error}
                    />
                  </div>
                </div>
                {/* Mitad derecha - Calendario */}
                <div className="w-full md:w-1/2 flex items-center justify-center min-h-[300px] md:min-h-0">
                  <div className="w-full h-full">
                    <CompactCalendar
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      appointments={appointments}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Acciones recientes */}
          <div className="flex-1 w-full lg:min-w-94 lg:max-w-116 2xl:max-w-[28rem]">
            <motion.div 
              className="bg-white rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 md:p-6 h-full min-h-[200px] lg:min-h-0 flex flex-col"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
            >
              <h3 className="text-xl md:text-2xl font-semibold text-center text-neutral-800 mb-4 md:mb-6 flex-shrink-0">
                Historial de Acciones
              </h3>
              <div className="flex-1 overflow-y-auto">
                <ActionHistoryList actions={actions} />
          </div>
        </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}