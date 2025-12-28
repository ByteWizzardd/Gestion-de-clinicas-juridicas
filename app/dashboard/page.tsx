import { getCitasAction } from '@/app/actions/citas';
import { getCasosByUsuarioAction, getAccionesRecientesAction } from '@/app/actions/casos';
import DashboardClient from '@/components/dashboard/DashboardClient';
import type { Appointment } from '@/types/appointment';

export default async function DashboardPage() {
  // Cargar citas, casos y acciones en el servidor
  const [citasResult, casosResult, accionesResult] = await Promise.all([
    getCitasAction(),
    getCasosByUsuarioAction(),
    getAccionesRecientesAction(10),
  ]);
  
  const appointments = citasResult.success && Array.isArray(citasResult.data) ? citasResult.data : [];
  const casos = casosResult.success && Array.isArray(casosResult.data) ? casosResult.data : [];
  const acciones = accionesResult.success && Array.isArray(accionesResult.data) ? accionesResult.data : [];

  // Debug logging
  if (!casosResult.success) {
    console.error('Error al obtener casos:', casosResult.error);
  } else {
    console.log('Casos obtenidos en servidor:', casos.length);
  }

  if (!accionesResult.success) {
    console.error('Error al obtener acciones:', accionesResult.error);
  } else {
    console.log('Acciones obtenidas en servidor:', acciones.length);
  }

  return <DashboardClient initialAppointments={appointments} initialCasos={casos} initialAcciones={acciones} />;
}
