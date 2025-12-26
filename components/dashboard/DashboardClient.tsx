'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import CompactCalendar from "@/components/ui/calendar/CompactCalendar";
import DashboardAppointmentList from "@/components/cards/DashboardAppointmentList";
import ActionHistoryList from "@/components/cards/ActionHistoryList";
import CasosList from "@/components/dashboard/CasosList";
import type { Appointment } from '@/types/appointment';

interface Caso {
  id_caso: number;
  fecha_inicio_caso: string;
  fecha_fin_caso: string | null;
  tramite: string;
  estatus: string;
  nombre_completo_solicitante: string;
  nombre_nucleo: string;
  nombre_materia: string;
  nombre_categoria: string;
  rol_usuario: string;
}

interface DashboardClientProps {
  initialAppointments: Appointment[];
  initialCasos: Caso[];
}

export default function DashboardClient({ initialAppointments, initialCasos }: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(
    initialAppointments.map((apt: any) => ({
      ...apt,
      date: new Date(apt.date),
    }))
  );
  const [casos] = useState<Caso[]>(initialCasos || []);

  useEffect(() => {
    console.log('Casos recibidos:', casos);
    console.log('Cantidad de casos:', casos.length);
  }, [casos]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mt-4 md:mt-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
        <div className="flex flex-col gap-4 md:gap-6 flex-1 max-w-full">
          <motion.div 
            className="bg-white rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 md:p-6 flex-1 flex flex-col min-h-0"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-xl md:text-2xl font-semibold text-neutral-800">
                Mis Casos
              </h3>
              <span className="text-sm text-gray-500">
                {casos.length} {casos.length === 1 ? 'caso' : 'casos'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 min-h-[200px] md:min-h-0">
              <CasosList 
                casos={casos}
                loading={false}
                error={null}
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 md:p-6 w-full lg:max-w-[calc(2*21.25rem+1.5rem)] 2xl:max-w-[calc(2*24rem+1.5rem)] flex-1 flex flex-col min-h-0"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0">
              <div className="w-full md:w-1/2 flex flex-col min-h-0">
                <h3 className="text-xl md:text-2xl font-semibold text-neutral-800 mb-3 md:mb-4 flex-shrink-0">
              Mi Agenda
            </h3>
                <div className="flex-1 overflow-y-auto pr-2 min-h-[200px] md:min-h-0">
                  <DashboardAppointmentList 
                    appointments={appointments} 
                    selectedDate={selectedDate}
                    loading={false}
                    error={null}
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2 flex items-center justify-center min-h-[300px] md:min-h-0">
                <div className="w-full h-full">
                  <CompactCalendar
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    appointments={appointments}
                    loading={false}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

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

