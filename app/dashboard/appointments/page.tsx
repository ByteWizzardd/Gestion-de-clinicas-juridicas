import { getCitasAction, getAppointmentFilterOptionsAction } from '@/app/actions/citas';
import { getCasosAction } from '@/app/actions/casos';
import AppointmentsClient from '@/components/appointments/AppointmentsClient';
import { authorizeRole } from '@/lib/utils/auth-utils';
import type { Appointment } from '@/types/appointment';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  // Permitir a todos los roles autenticados
  await authorizeRole(['coordinator', 'professor', 'student']);

  // Cargar citas (todas y filtradas), opciones de filtros y casos en paralelo
  const [citasResult, userCitasResult, filterOptionsResult, casosResult] = await Promise.all([
    getCitasAction(),
    getCitasAction({ onlyMine: true }),
    getAppointmentFilterOptionsAction(),
    getCasosAction(),
  ]);

  const appointments = citasResult.success && Array.isArray(citasResult.data)
    ? (citasResult.data as Appointment[])
    : [];

  const userAppointments = userCitasResult.success && Array.isArray(userCitasResult.data)
    ? (userCitasResult.data as Appointment[])
    : [];

  const baseFilterOptions = filterOptionsResult.success && filterOptionsResult.data
    ? filterOptionsResult.data
    : { nucleos: [], usuarios: [] };

  const casos = casosResult.success && Array.isArray(casosResult.data)
    ? (casosResult.data as any[]).map(caso => ({
      id_caso: caso.id_caso,
      tramite: caso.tramite || 'Sin trámite'
    }))
    : [];

  const filterOptions = {
    ...baseFilterOptions,
    casos,
  };

  return (
    <AppointmentsClient
      initialAppointments={appointments}
      initialUserAppointments={userAppointments}
      initialFilterOptions={filterOptions}
    />
  );
}