import { getCitasAction, getAppointmentFilterOptionsAction } from '@/app/actions/citas';
import AppointmentsClient from '@/components/appointments/AppointmentsClient';
import { authorizeRole } from '@/lib/utils/auth-utils';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  // Permitir a todos los roles autenticados
  await authorizeRole(['coordinator', 'professor', 'student']);

  // Cargar citas y opciones de filtros en paralelo
  const [citasResult, filterOptionsResult] = await Promise.all([
    getCitasAction(),
    getAppointmentFilterOptionsAction(),
  ]);

  const appointments = citasResult.success && Array.isArray(citasResult.data) ? citasResult.data : [];
  const filterOptions = filterOptionsResult.success && filterOptionsResult.data 
    ? filterOptionsResult.data 
    : { nucleos: [], usuarios: [] };

  return (
    <AppointmentsClient 
      initialAppointments={appointments}
      initialFilterOptions={filterOptions}
    />
  );
}