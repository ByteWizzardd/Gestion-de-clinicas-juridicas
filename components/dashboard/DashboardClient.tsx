'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import CompactCalendar from "@/components/ui/calendar/CompactCalendar";
import DashboardAppointmentList from "@/components/cards/DashboardAppointmentList";
import ActionHistoryList from "@/components/cards/ActionHistoryList";
import CasosList from "@/components/dashboard/CasosList";
import { AppointmentDetailModal } from "@/components/appointmentModal/AppointmentDetailModal";
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
  nombre_subcategoria: string;
  rol_usuario: string;
}

interface AccionReciente {
  num_accion: number;
  id_caso: number;
  detalle_accion: string;
  comentario: string | null;
  id_usuario_registra: string;
  fecha_registro: string;
  nombres_usuario_registra: string;
  apellidos_usuario_registra: string;
  nombre_completo_usuario_registra: string;
  caso_id: number;
  nombre_solicitante: string;
  nombre_nucleo: string;
  ejecutores: Array<{
    id_usuario: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    fecha_ejecucion: string;
  }>;
}

interface DashboardClientProps {
  initialAppointments: Appointment[];
  initialCasos: Caso[];
  initialAcciones?: AccionReciente[];
}

import { triggerInactiveCasesCheckAction } from '@/app/actions/automation';

export default function DashboardClient({ initialAppointments, initialCasos, initialAcciones = [] }: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(
    initialAppointments.map((apt: any) => ({
      ...apt,
      date: new Date(apt.date),
    }))
  );
  const [casos] = useState<Caso[]>(initialCasos || []);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Trigger automation (inactive cases check)
  useEffect(() => {
    const runAutomation = async () => {
      try {
        // Fire and forget - logs handled in action/server
        await triggerInactiveCasesCheckAction();
      } catch (error) {
        console.error('Automation background check failed', error);
      }
    };
    runAutomation();
  }, []);

  // Manejadores para el modal de detalles de citas
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleAppointmentModalClose = () => {
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
  };

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

  // Mapear acciones de la BD al formato esperado por ActionHistoryList
  const actions = useMemo(() => {
    return initialAcciones.map((accion) => {
      // Formatear fecha de registro (parsear como local para evitar problemas de zona horaria)
      const fechaStr = accion.fecha_registro;
      let dia: number, mes: number, año: number;

      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      if (typeof fechaStr === 'string' && fechaStr.includes('-')) {
        // Parsear manualmente para evitar problemas de zona horaria
        const parts = fechaStr.split('-');
        año = parseInt(parts[0], 10);
        mes = parseInt(parts[1], 10) - 1; // Los meses en JS son 0-indexed
        dia = parseInt(parts[2], 10);
      } else {
        // Si es un objeto Date, usar los métodos locales
        const fecha = typeof fechaStr === 'string' ? new Date(fechaStr) : fechaStr;
        // Usar métodos locales para evitar conversión UTC
        dia = fecha.getDate();
        mes = fecha.getMonth();
        año = fecha.getFullYear();
      }

      const fechaFormateada = `${dia} ${meses[mes]} ${año}`;

      // Formatear fecha de ejecución (del primer ejecutor si existe)
      let fechaEjecucionFormateada = '';
      if (accion.ejecutores && accion.ejecutores.length > 0) {
        const fEj = accion.ejecutores[0].fecha_ejecucion;
        if (typeof fEj === 'string' && fEj.includes('-')) {
          const parts = fEj.split('-');
          const dE = parseInt(parts[2], 10);
          const mE = parseInt(parts[1], 10) - 1;
          const aE = parseInt(parts[0], 10);
          fechaEjecucionFormateada = `${dE} ${meses[mE]} ${aE}`;
        } else {
          const dateEj = new Date(fEj);
          fechaEjecucionFormateada = `${dateEj.getDate()} ${meses[dateEj.getMonth()]} ${dateEj.getFullYear()}`;
        }
      }

      // Información del caso sin nombre del solicitante y con fecha de ejecución
      const caseInfo = `Caso: ${accion.id_caso} - ${accion.nombre_nucleo}${fechaEjecucionFormateada ? ` • Ejecución: ${fechaEjecucionFormateada}` : ''}`;

      return {
        mainText: accion.detalle_accion,
        subText: accion.comentario || undefined,
        caseInfo,
        date: fechaFormateada,
      };
    });
  }, [initialAcciones]);

  return (
    <div className="max-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          // ... rest of component stays same

          className="mb-4 md:mb-6 mt-4"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
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
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-xl md:text-2xl font-semibold text-neutral-800">
                  Mis Casos
                </h3>
                <span className="text-sm text-gray-500">
                  {casos.length} {casos.length === 1 ? 'caso' : 'casos'}
                </span>
              </div>
              <div className="flex-1 pr-2 overflow-y-auto min-h-0 w-full">
                <CasosList
                  casos={casos}
                  loading={false}
                  error={null}
                />
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl md:rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] p-4 md:p-6 w-full flex-1 flex flex-col min-h-0"
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
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
                      onAppointmentClick={handleAppointmentClick}
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
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
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

      {/* Modal de detalles de cita */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={showAppointmentModal}
        onClose={handleAppointmentModalClose}
      />
    </div>
  );
}

