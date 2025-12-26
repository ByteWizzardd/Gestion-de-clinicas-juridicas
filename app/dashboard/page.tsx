import { getCitasAction } from '@/app/actions/citas';
import { getCasosByUsuarioAction } from '@/app/actions/casos';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  // Cargar citas y casos en el servidor
  const [citasResult, casosResult] = await Promise.all([
    getCitasAction(),
    getCasosByUsuarioAction(),
  ]);
  
  const appointments = citasResult.success ? citasResult.data || [] : [];
  const casos = casosResult.success ? casosResult.data || [] : [];

  // Debug logging
  if (!casosResult.success) {
    console.error('Error al obtener casos:', casosResult.error);
  } else {
    console.log('Casos obtenidos en servidor:', casos.length);
  }

  return <DashboardClient initialAppointments={appointments} initialCasos={casos} />;
}
