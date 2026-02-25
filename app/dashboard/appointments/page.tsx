import { getCitasAction, getAppointmentFilterOptionsAction } from '@/app/actions/citas';
import { getCasosAction } from '@/app/actions/casos';
import { getSemestres } from '@/app/actions/catalogos/semestres.actions';
import { getCurrentTermAction } from '@/app/actions/estudiantes';
import AppointmentsClient from '@/components/appointments/AppointmentsClient';
import { authorizeRole } from '@/lib/utils/auth-utils';
import type { Appointment } from '@/types/appointment';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  // Permitir a todos los roles autenticados
  await authorizeRole(['coordinator', 'professor', 'student']);

  // Cargar citas (todas y filtradas), opciones de filtros, casos, semestres y el término actual en paralelo
  const [citasResult, userCitasResult, filterOptionsResult, casosResult, semestresResult, currentTermResult] = await Promise.all([
    getCitasAction(),
    getCitasAction({ onlyMine: true }),
    getAppointmentFilterOptionsAction(),
    getCasosAction(),
    getSemestres(),
    getCurrentTermAction(),
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

  const semestresData = semestresResult.success && Array.isArray(semestresResult.data)
    ? semestresResult.data.map((s: any) => ({
      term: s.term,
      fecha_inicio: s.fecha_inicio instanceof Date ? s.fecha_inicio.toISOString().split('T')[0] : s.fecha_inicio,
      fecha_fin: s.fecha_fin instanceof Date ? s.fecha_fin.toISOString().split('T')[0] : s.fecha_fin,
    })).sort((a, b) => b.term.localeCompare(a.term))
    : [];

  const initialTermFilter = currentTermResult.success && currentTermResult.data?.term
    ? currentTermResult.data.term
    : '';

  return (
    <AppointmentsClient
      initialAppointments={appointments}
      initialUserAppointments={userAppointments}
      initialFilterOptions={filterOptions}
      semestresData={semestresData}
      initialTermFilter={initialTermFilter}
    />
  );
}